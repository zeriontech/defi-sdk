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
import { DVM } from "../../interfaces/DVM.sol";

/**
 * @title Interactive adapter for DODO V2 (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract DodoV2AssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the DODO V2 pool.
     * @param tokenAmounts Array with two elements - TokenAmount structs with
     * tokens addresses, token amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameter:
     *     - pool - DODO V2 pool address.
     * @return tokensToBeWithdrawn Array with one element - DODO V2 pool address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 2, "D2AIA: should be 2 tokenAmounts");

        address pool = abi.decode(data, (address));
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pool;

        (uint256 baseAmount, uint256 quoteAmount) =
            getAmounts(
                pool,
                getAbsoluteAmountDeposit(tokenAmounts[0]),
                getAbsoluteAmountDeposit(tokenAmounts[1])
            );

        ERC20(tokenAmounts[0].token).safeTransfer(pool, baseAmount, "D2AIA[1]");
        ERC20(tokenAmounts[1].token).safeTransfer(pool, quoteAmount, "D2AIA[2]");

        // solhint-disable-next-line no-empty-blocks
        try DVM(pool).buyShares(address(this)) returns (uint256, uint256, uint256) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("D2AIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the DODO V2 pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     *     DODO pool address, amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with two elements - underlying tokens addresses.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "D2AIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = DVM(token)._BASE_TOKEN_();
        tokensToBeWithdrawn[1] = DVM(token)._QUOTE_TOKEN_();

        try
            DVM(token).sellShares(
                amount,
                address(this),
                0,
                0,
                new bytes(0),
                // solhint-disable-next-line not-rely-on-time
                block.timestamp
            )
        returns (uint256, uint256) {} catch Error(
            // solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("D2AIA: withdraw fail");
        }
    }

    function getAmounts(
        address pool,
        uint256 baseAmount,
        uint256 quoteAmount
    ) internal view returns (uint256, uint256) {
        (uint256 baseReserve, uint256 quoteReserve) = DVM(pool).getVaultReserve();
        if (baseReserve == 0 && quoteReserve == 0) {
            return (baseAmount, quoteAmount);
        }
        if (baseReserve > 0 && quoteReserve == 0) {
            return (baseAmount, 0);
        }
        if (baseReserve == 0 && quoteReserve > 0) {
            return (0, 0);
        }

        uint256 baseIncreaseRatio = divFloor(baseAmount, baseReserve);
        uint256 quoteIncreaseRatio = divFloor(quoteAmount, quoteReserve);
        if (baseIncreaseRatio <= quoteIncreaseRatio) {
            return (baseAmount, mulFloor(quoteReserve, baseIncreaseRatio));
        } else {
            return (mulFloor(baseReserve, quoteIncreaseRatio), quoteAmount);
        }
    }

    function mulFloor(uint256 target, uint256 d) internal pure returns (uint256) {
        return mul(target, d) / (10**18);
    }

    function divFloor(uint256 target, uint256 d) internal pure returns (uint256) {
        return mul(target, 10**18) / d;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "D2AIA: mul overflow");

        return c;
    }
}
