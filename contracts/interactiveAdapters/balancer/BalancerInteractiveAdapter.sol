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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { BalancerAdapter } from "../../adapters/balancer/BalancerAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev BPool contract interface.
 * Only the functions required for BalancerInteractiveAdapter contract are added.
 * The BPool contract is available here
 * github.com/balancer-labs/balancer-core/blob/master/contracts/BPool.sol.
 */
interface BPool {
    function joinPool(uint256, uint256[] calldata) external;
    function exitPool(uint256, uint256[] calldata) external;
    function getFinalTokens() external view returns (address[] memory);
}


/**
 * @title Interactive adapter for Balancer (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BalancerInteractiveAdapter is InteractiveAdapter, BalancerAdapter {

    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Balancer pool.
     * @param tokens Array with tokens addresses.
     * @param amounts Array with tokens amounts to be deposited.
     * @param amountTypes Array with amount types.
     * @param data ABI-encoded additional parameters:
     *     - poolAddress - pool address;
     *     - poolAmount - pool amount.
     * @return tokensToBeWithdrawn Array with one element - pool address.
     * @dev Implementation of InteractiveAdapter function.
     * TODO remove tokens, amount, approve exact amount
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == amounts.length, "BIA: inconsistent arrays![1]");

        (address poolAddress, uint256 poolAmount) = abi.decode(data, (address, uint256));
        uint256 amount;
        uint256[] memory maxAmounts = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            amount = getAbsoluteAmountDeposit(tokens[i], amounts[i], amountTypes[i]);
            ERC20(tokens[i]).safeApprove(poolAddress, amount, "BIA![1]");
            maxAmounts[i] = type(uint256).max;
        }

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = poolAddress;

        try BPool(poolAddress).joinPool(
            poolAmount,
            maxAmounts
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch {
            revert("BIA: pool fail![1]");
        }

        for (uint256 i = 0; i < tokens.length; i++) {
            ERC20(tokens[i]).safeApprove(poolAddress, 0, "BIA![2]");
        }
    }

    /**
     * @notice Withdraws tokens from the Balancer pool.
     * @param tokens Array with one element - pool address.
     * @param amounts Array with one element - pool amount to be burned.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with pool's underlying tokens.
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
        require(tokens.length == 1, "BIA: should be 1 token!");
        require(tokens.length == amounts.length, "BIA: inconsistent arrays![2]");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = BPool(tokens[0]).getFinalTokens();
        uint256[] memory minReturns = new uint256[](tokensToBeWithdrawn.length);
        for (uint256 i = 0; i < minReturns.length; i++) {
            minReturns[i] = 0;
        }

        try BPool(tokens[0]).exitPool(
            amount,
            minReturns
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch {
            revert("BIA: pool fail![2]");
        }
    }
}
