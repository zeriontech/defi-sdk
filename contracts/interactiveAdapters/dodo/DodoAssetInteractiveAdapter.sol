// Copyright (C) 2020 Zerion Inc. <https://zerion.io>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.
//
// SPDX-License-Identifier: LGPL-3.0-only

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount, AmountType } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { DODO } from "../../interfaces/DODO.sol";
import { DODOLpToken } from "../../interfaces/DODOLpToken.sol";

/**
 * @title Interactive adapter for DODO (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract DodoAssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the DODO pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * token address, token amount to be deposited, and amount type.
     * @param data ABI-encoded additional parameter:
     *     - pool - DODO lp (capital token) address.
     * @return tokensToBeWithdrawn Array with one element - DODO lp (capital token) address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "DAIA: should be 1 tokenAmount[1]");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        address lpToken = abi.decode(data, (address));

        address dodo = DODOLpToken(lpToken)._OWNER_();

        ERC20(token).safeApproveMax(dodo, amount, "DAIA");

        function(uint256) external returns (uint256) dodoDeposit =
            isBaseToken(token, dodo) ? DODO(dodo).depositBase : DODO(dodo).depositQuote;

        // solhint-disable-next-line no-empty-blocks
        try dodoDeposit(amount) returns (uint256) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("DAIA: deposit fail");
        }

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = lpToken;
    }

    /**
     * @notice Withdraws tokens from the DODO pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * DODO lp (capital token) address, amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with one element - destination token address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "DAIA: should be 1 tokenAmount[2]");

        address token = tokenAmounts[0].token;
        address toToken = DODOLpToken(token).originToken();
        address dodo = DODOLpToken(token)._OWNER_();

        if (tokenAmounts[0].amount == 1e18 && tokenAmounts[0].amountType == AmountType.Relative) {
            function() external returns (uint256) dodoWithdraw =
                isBaseToken(toToken, dodo)
                    ? DODO(dodo).withdrawAllBase
                    : DODO(dodo).withdrawAllQuote;

            // solhint-disable-next-line no-empty-blocks
            try dodoWithdraw() returns (uint256) {} catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("DAIA: withdraw fail");
            }
        } else {
            uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

            (uint256 baseTarget, uint256 quoteTarget) = DODO(dodo).getExpectedTarget();
            function(uint256) external returns (uint256) dodoWithdraw;
            uint256 withdrawAmount;
            if (isBaseToken(toToken, dodo)) {
                dodoWithdraw = DODO(dodo).withdrawBase;
                withdrawAmount = mul_(amount - 1, baseTarget) / DODO(dodo).getTotalBaseCapital();
            } else {
                dodoWithdraw = DODO(dodo).withdrawQuote;
                withdrawAmount = mul_(amount - 1, quoteTarget) / DODO(dodo).getTotalQuoteCapital();
            }

            // solhint-disable-next-line no-empty-blocks
            try dodoWithdraw(withdrawAmount) returns (uint256) {} catch Error(
                string memory reason
            ) {
                revert(reason);
            } catch {
                revert("DAIA: withdraw fail");
            }
        }

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toToken;
    }

    function isBaseToken(address token, address dodo) internal view returns (bool) {
        return token == DODO(dodo)._BASE_TOKEN_();
    }
}
