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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { CompoundAssetAdapter } from "../../adapters/compound/CompoundAssetAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev LendingPoolAddressesProvider contract interface.
 * Only the functions required for AaveAssetInteractiveAdapter contract are added.
 * The LendingPoolAddressesProvider contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/configuration/LendingPoolAddressesProvider.sol.
 */
interface LendingPoolAddressesProvider {
    function getLendingPool() external view returns (address);
    function getLendingPoolCore() external view returns (address);
}


/**
 * @dev LendingPool contract interface.
 * Only the functions required for AaveAssetInteractiveAdapter contract are added.
 * The LendingPool contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/lendingpool/LendingPool.sol.
 */
interface LendingPool {
    function deposit(address, uint256, uint16) external payable;
}


/**
 * @dev LendingPoolCore contract interface.
 * Only the functions required for AaveAssetInteractiveAdapter contract are added.
 * The LendingPoolCore contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/lendingpool/LendingPoolCore.sol.
 */
interface LendingPoolCore {
    function getReserveATokenAddress(address) external view returns (address);
}


/**
 * @dev AToken contract interface.
 * Only the functions required for AaveAssetInteractiveAdapter contract are added.
 * The AToken contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/tokenization/AToken.sol.
 */
interface AToken {
    function redeem(uint256) external;
    function underlyingAssetAddress() external view returns (address);
}


/**
 * @title Interactive adapter for Compound protocol.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract AaveAssetInteractiveAdapter is InteractiveAdapter, CompoundAssetAdapter {

    using SafeERC20 for ERC20;

    address internal constant AETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;

    /**
     * @notice Deposits tokens to the Compound protocol.
     * @param tokens Array with one element - underlying token address.
     * @param amounts Array with one element - underlying token amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with two elements - cToken and COMP addresses.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "AAIA: should be 1 token![1]");
        require(tokens.length == amounts.length, "AAIA: inconsistent arrays![1]");

        address pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();
        address core = LendingPoolAddressesProvider(PROVIDER).getLendingPoolCore();

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = LendingPoolCore(core).getReserveATokenAddress(tokens[0]);

        if (tokens[0] == ETH) {
            try LendingPool(pool).deposit{value: amount}(ETH, amount, 0) {
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("AAIA: deposit fail![1]");
            }
        } else {
            ERC20(tokens[0]).safeApprove(core, amount, "AAIA!");
            try LendingPool(pool).deposit(tokens[0], amount, 0) {
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("AAIA: deposit fail![2]");
            }
        }
    }

    /**
     * @notice Withdraws tokens from the Compound protocol.
     * @param tokens Array with one element - cToken address.
     * @param amounts Array with one element - cToken amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with two elements - underlying token and COMP addresses.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "AAIA: should be 1 token![2]");
        require(tokens.length == amounts.length, "AAIA: inconsistent arrays![2]");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = AToken(tokens[0]).underlyingAssetAddress();

        try AToken(tokens[0]).redeem(amount) {
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("AAIA: withdraw fail!");
        }
    }
}
