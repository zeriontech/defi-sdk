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

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { NavIssuanceModule } from "../../interfaces/NavIssuanceModule.sol";
import { SetTokenV2 } from "../../interfaces/SetTokenV2.sol";

/**
 * @title Interactive adapter for TokenSets (v2).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenSetsNavInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant ISSUANCE_MODULE = 0xCd34F1b92C6d0d03430ec4A410F758F7776a3504;

    /**
     * @notice Deposits tokens to the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying token address, underlying tokens amount to be deposited, and amount type.
     * @param data ABI-encoded additional parameters:
     *     - set - rebalancing set (v2) address.
     * @return tokensToBeWithdrawn Array with one element - rebalancing set address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "TSNIA: should be 1 tokenAmount");
        address setToken = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = setToken;

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        ERC20(token).safeApproveMax(ISSUANCE_MODULE, amount, "TSNIA");

        try
            NavIssuanceModule(ISSUANCE_MODULE).issue(setToken, token, amount, 0, address(this))
        {} catch Error(string memory reason) {
            // solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("TSNIA: issue fail");
        }
    }

    /**
     * @notice Withdraws tokens from the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * rebalancing set (v2) address, rebalancing set amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with set token components.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "TSNIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);
        address toToken = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toToken;

        try
            NavIssuanceModule(ISSUANCE_MODULE).redeem(token, toToken, amount, 0, address(this))
        {} catch Error(
            // solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("TSNIA: redeem fail");
        }
    }
}
