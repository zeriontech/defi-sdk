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

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { AToken } from "../../interfaces/AToken.sol";
import { LendingPoolAddressesProvider } from "../../interfaces/LendingPoolAddressesProvider.sol";
import { LendingPool } from "../../interfaces/LendingPool.sol";
import { LendingPoolCore } from "../../interfaces/LendingPoolCore.sol";

/**
 * @title Interactive adapter for Aave protocol.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract AaveAssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;

    /**
     * @notice Deposits tokens to the Aave protocol.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying token address, underlying token amount to be deposited, and amount type.
     * @return tokensToBeWithdrawn Array with ane element - aToken.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "AAIAv2: should be 1 tokenAmount[1]");

        address pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = LendingPool(pool).getReserveATokenAddress(token);

        ERC20(token).safeApproveMax(core, amount, "AAIAv2");

        try LendingPool(pool).deposit(token, amount, address(this), 0)  {} catch Error(
            string memory reason
        ) {
            // solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("AAIA: deposit fail[2]");
        }
    }

    /**
     * @notice Withdraws tokens from the Aave protocol.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * aToken address, aToken amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with one element - underlying token.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "AAIAv2: should be 1 tokenAmount[2]");

        address pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();

        address underlyingToken = AToken(tokenAmounts[0].token).underlyingAssetAddress();
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = underlyingToken;

        try LendingPool(pool).withdraw(underlyingToken, amount, address(this))  {} catch Error(
            string memory reason
        ) {
            // solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("AAIAv2: withdraw fail");
        }
    }
}
