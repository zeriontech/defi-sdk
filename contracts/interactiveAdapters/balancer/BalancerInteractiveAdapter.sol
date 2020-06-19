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
import { BalancerAdapter } from "../../adapters/balancer/BalancerAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev BPool contract interface.
 * Only the functions required for BalancerInteractiveAdapter contract are added.
 * The BPool contract is available here
 * github.com/balancer-labs/balancer-core/blob/master/contracts/BPool.sol.
 */
interface BPool {
    function joinswapExternAmountIn(address, uint256, uint256) external;
    function exitswapPoolAmountIn(address, uint256, uint256) external;
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
     * @param tokens Array with one element - tokens address to be deposited.
     * @param amounts Array with one element - tokens amount to be deposited.
     * @param amountTypes Array with amount type.
     * @param data ABI-encoded additional parameters:
     *     - poolAddress - pool address.
     * @return tokensToBeWithdrawn Array with one element - pool address.
     * @dev Implementation of InteractiveAdapter function.
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
        require(tokens.length == 1, "BIA: should be 1 token![1]");
        require(tokens.length == amounts.length, "BIA: inconsistent arrays![1]");

        address poolAddress = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = poolAddress;

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);
        ERC20(tokens[0]).safeApprove(poolAddress, amount, "BIA!");

        try BPool(poolAddress).joinswapExternAmountIn(
            tokens[0],
            amount,
            0
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch {
            revert("BIA: deposit fail!");
        }
    }

    /**
     * @notice Withdraws tokens from the Balancer pool.
     * @param tokens Array with one element - pool address.
     * @param amounts Array with one element - pool amount.
     * @param amountTypes Array with one element - amount type.
     * @param data ABI-encoded additional parameters:
     *     - toTokenAddress - destination token address.
     * @return tokensToBeWithdrawn Array with one element - destination token address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
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
        require(tokens.length == 1, "BIA: should be 1 token![2]");
        require(tokens.length == amounts.length, "BIA: inconsistent arrays![2]");

        address toTokenAddress = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toTokenAddress;

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        try BPool(tokens[0]).exitswapPoolAmountIn(
            toTokenAddress,
            amount,
            0
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch {
            revert("BIA: withdraw fail!");
        }
    }
}
