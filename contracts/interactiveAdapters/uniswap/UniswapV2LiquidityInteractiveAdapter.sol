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
import { UniswapV2LiquidityAdapter } from "../../adapters/uniswap/UniswapV2LiquidityAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev UniswapV2Router01 contract interface.
 * Only the functions required for UniswapV2LiquidityInteractiveAdapter contract are added.
 * The UniswapV2Router01 contract is available here
 * github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/UniswapV2Router01.sol.
 */
interface UniswapV2Router01 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
}


/**
 * @dev UniswapV2Pair contract interface.
 * Only the functions required for UniswapV2LiquidityInteractiveAdapter contract are added.
 * The UniswapV2Pair contract is available here
 * github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2Pair.sol.
 */
interface UniswapV2Pair {
    function token0() external view returns (address);
    function token1() external view returns (address);
}


/**
 * @title Interactive adapter for Uniswap V2 protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2LiquidityInteractiveAdapter is InteractiveAdapter, UniswapV2LiquidityAdapter {

    using SafeERC20 for ERC20;

    address internal constant ROUTER = 0xf164fC0Ec4E93095b804a4795bBe1e041497b92a;
    address internal constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    /**
     * @notice Deposits tokens to the Uniswap pool.
     * @param tokens Array with two elements - token0 and token1 addresses.
     * @param amounts Array with two elements - amounts to be deposited.
     * @param amountTypes Array with two elements - amount types.
     * @return tokensToBeWithdrawn Array with tokens sent back.
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
        require(tokens.length == 2, "ULIA: should be 2 tokens/amounts/types!");

        uint256 token0Amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);
        uint256 token1Amount = getAbsoluteAmountDeposit(tokens[1], amounts[1], amountTypes[1]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pairFor(FACTORY, tokens[0], tokens[1]);

        ERC20(tokens[0]).safeApprove(ROUTER, token0Amount, "ULIA![1]");
        ERC20(tokens[1]).safeApprove(ROUTER, token1Amount, "ULIA![2]");
        try UniswapV2Router01(ROUTER).addLiquidity(
            tokens[0],
            tokens[1],
            token0Amount,
            token1Amount,
            0,
            0,
            address(this),
            // solhint-disable-next-line not-rely-on-time
            now
        ) returns (uint, uint, uint addedLiquidity) {
            require(addedLiquidity > 0, "ULIA: deposit fail![1]");
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULIA: deposit fail![2]");
        }

        ERC20(tokens[0]).safeApprove(ROUTER, 0, "ULIA![3]");
        ERC20(tokens[1]).safeApprove(ROUTER, 0, "ULIA![4]");
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokens Array with one element - UNI-token (pair) address.
     * @param amounts Array with one element - UNI-token amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with on element - underlying token.
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
        require(tokens.length == 1, "ULIA: should be 1 token/amount/type!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        address token0 = UniswapV2Pair(tokens[0]).token0();
        address token1 = UniswapV2Pair(tokens[0]).token1();

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = token0;
        tokensToBeWithdrawn[1] = token1;

        ERC20(tokens[0]).safeApprove(ROUTER, amount, "ULIA![5]");

        try UniswapV2Router01(ROUTER).removeLiquidity(
            token0,
            token1,
            amount,
            0,
            0,
            address(this),
            // solhint-disable-next-line not-rely-on-time
            now
        ) returns (uint, uint) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULIA: deposit fail![2]");
        }
    }

    /**
     * @dev Calculates the CREATE2 address for a pair without making any external calls.
     * The function is taken from UniswapV2Library contract with some modifications.
     * UniswapV2Library contract may be found here:
     * github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol.
     */
    function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        pair = address(uint(keccak256(abi.encodePacked(
            hex'ff',
            factory,
            keccak256(abi.encodePacked(token0, token1)),
            hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
        ))));
    }
}
