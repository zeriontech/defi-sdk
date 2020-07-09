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

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { Action, AmountType } from "../../shared/Structs.sol";
import { UniswapExchangeAdapter } from "../../adapters/uniswap/UniswapExchangeAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev UniswapV2Router01 contract interface.
 * Only the functions required for UniswapV2ExchangeInteractiveAdapter contract are added.
 * The UniswapV2Router01 contract is available here
 * github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/UniswapV2Router01.sol.
 */
interface UniswapV2Router01 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

/**
 * @title Interactive adapter for Uniswap V2 protocol (exchange).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2ExchangeInteractiveAdapter is InteractiveAdapter, UniswapExchangeAdapter {
    using SafeERC20 for ERC20;

    address internal constant ROUTER = 0xf164fC0Ec4E93095b804a4795bBe1e041497b92a;

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param amounts Array with one element - token amount to be exchanged from.
     * @param amountTypes Array with one element - amount type.
     * @param data Uniswap exchange path starting from tokens[0] (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be exchanged to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(amounts.length == 1, "UEIA: should be 1 amount/amountType!");

        address[] memory path = abi.decode(data, (address[]));
        uint256 amount = getAbsoluteAmountDeposit(path[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = path[path.length - 1];

        ERC20(path[0]).safeApprove(ROUTER, amount, "UEIA![1]");

        try UniswapV2Router01(ROUTER).swapExactTokensForTokens(
            amount,
            0,
            path,
            address(this),
            // solhint-disable-next-line not-rely-on-time
            now
        ) returns (uint256[] memory amountsOut) {
            require(amountsOut[amountsOut.length - 1] > 0, "UEIA: deposit fail![1]");
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("UEIA: deposit fail![2]");
        }
    }

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param amounts Array with one element - token amount to be exchanged to.
     * @param amountTypes Array with one element - amount type (can be `AmountType.Absolute` only).
     * @param data Uniswap exchange path ending with tokens[0] (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be changed to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] memory,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(amounts.length == 1, "UEIA: should be 1 amount/amountType!");
        require(amountTypes[0] == AmountType.Absolute, "UEIA: bad type!");

        address[] memory path = abi.decode(data, (address[]));
        uint256 amount = getAbsoluteAmountDeposit(path[path.length - 1], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = path[path.length - 1];

        ERC20(path[0]).safeApprove(ROUTER, ERC20(path[0]).balanceOf(address(this)), "UEIA![2]");

        try UniswapV2Router01(ROUTER).swapTokensForExactTokens(
            amount,
            type(uint256).max,
            path,
            address(this),
            // solhint-disable-next-line not-rely-on-time
            now
        ) returns (uint256[] memory amountsOut) {
            require(amountsOut[amountsOut.length - 1] == amount, "UEIA: deposit fail![1]");
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("UEIA: deposit fail![2]");
        }

        ERC20(path[0]).safeApprove(ROUTER, 0, "UEIA![3]");
    }
}
