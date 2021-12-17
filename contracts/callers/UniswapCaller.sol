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

pragma solidity 0.8.10;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ICaller } from "../interfaces/ICaller.sol";
import { IUniswapV2Pair } from "../interfaces/IUniswapV2Pair.sol";
import { IWETH9 } from "../interfaces/IWETH9.sol";
import { Base } from "../shared/Base.sol";
import { SwapType } from "../shared/Enums.sol";
import {
    InconsistentPairsAndDirectionsLengths,
    InputSlippage,
    LowLiquidity,
    ZeroAmountIn,
    ZeroAmountOut,
    ZeroLength
} from "../shared/Errors.sol";
import { AbsoluteInput } from "../shared/Structs.sol";
import { TokensHandler } from "../shared/TokensHandler.sol";

/**
 * @title Uniswap caller that executes swaps on UniswapV2-like pools
 */
contract UniswapCaller is ICaller, TokensHandler {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Main external function:
     *     executes swap using Uniswap-like pools and returns tokens to the account
     * @param callerCallData ABI-encoded parameters:
     *     - pairs Array of uniswap-like pairs
     *     - directions Array of exchange directions (`true` means `token0` -> `token1`)
     *     - swapType Whether input or output amount is fixed
     *     - fixedSideAmount Amount of the token which is fixed (see `swapType`)
     *     - unwrap Bool indicating whether WETH should be unwrapped to ETH
     * @dev Implementation of Caller interface function
     */
    function callBytes(bytes calldata callerCallData) external payable override {
        (
            address[] memory pairs,
            bool[] memory directions,
            SwapType swapType,
            uint256 fixedSideAmount,
            bool unwrap
        ) = abi.decode(callerCallData, (address[], bool[], SwapType, uint256, bool));

        uint256[] memory amounts = (swapType == SwapType.FixedInputs)
            ? getAmountsOut(fixedSideAmount, pairs, directions)
            : getAmountsIn(fixedSideAmount, pairs, directions);

        uint256 length = pairs.length;
        if (length == 0) revert ZeroLength();
        if (directions.length != length)
            revert InconsistentPairsAndDirectionsLengths(directions.length, length);

        // Take input tokens and transfer to the first pair
        {
            address token = directions[0]
                ? IUniswapV2Pair(pairs[0]).token0()
                : IUniswapV2Pair(pairs[0]).token1();

            if (msg.value > 0) {
                if (amounts[0] > msg.value) revert InputSlippage(msg.value, amounts[0]);
                depositWeth(pairs[0], amounts[0]);
            } else {
                uint256 balance = IERC20(token).balanceOf(msg.sender);
                if (amounts[0] > balance) revert InputSlippage(balance, amounts[0]);
                SafeERC20.safeTransferFrom(IERC20(token), msg.sender, pairs[0], amounts[0]);
            }
        }

        // Do the swaps via the given pairs
        {
            address destination = unwrap ? address(this) : msg.sender;

            for (uint256 i = 0; i < length; i++) {
                uint256 next = i + 1;
                (uint256 amount0Out, uint256 amount1Out) = directions[i]
                    ? (uint256(0), amounts[next])
                    : (amounts[next], uint256(0));
                IUniswapV2Pair(pairs[i]).swap(
                    amount0Out,
                    amount1Out,
                    next < length ? pairs[next] : destination,
                    new bytes(0)
                );
            }
        }

        // Unwrap WETH if any and withdraw Ether (in case of Ether refund or `unwrap == true`)
        withdrawEth(unwrap, amounts[0]);
    }

    /**
     * @notice Wraps Ether and transfers to the provided pair
     * @param pair Address of the pair to transfer tokens to
     * @param amount Amount of tokens to be transferred
     */
    function depositWeth(address pair, uint256 amount) internal {
        IWETH9(WETH).deposit{ value: amount }();
        Base.transfer(WETH, pair, amount);
    }

    /**
     * @notice Unwraps Wrapped Ether (if necessary) and transfer Ether to the `msg.sender`
     */
    function withdrawEth(bool unwrap, uint256 amount) internal {
        uint256 wethBalance = 0;
        if (unwrap) {
            wethBalance = IERC20(WETH).balanceOf(address(this));
            if (wethBalance != 0) IWETH9(WETH).withdraw(wethBalance);
        }

        uint256 ethAmount = msg.value > 0 ? msg.value - amount + wethBalance : wethBalance;

        Base.transfer(ETH, msg.sender, ethAmount);
    }

    /**
     * @notice Calculates the required amounts for multiple swaps in case of fixed output amount
     * @param amountOut Amount of tokens returned after the last swap
     * @param pairs Array of uniswap-like pairs
     * @param directions Array of exchange directions (`true` means token0 -> token1)
     * @return amountsIn Amounts required for the multiple swaps
     * @dev Performs chained getAmountIn calculations
     */
    function getAmountsIn(
        uint256 amountOut,
        address[] memory pairs,
        bool[] memory directions
    ) internal view returns (uint256[] memory amountsIn) {
        uint256 length = pairs.length;

        amountsIn = new uint256[](length + 1);
        amountsIn[length] = amountOut;

        for (uint256 i = length; i > 0; i--) {
            uint256 prev = i - 1;
            amountsIn[prev] = getAmountIn(amountsIn[i], pairs[prev], directions[prev]);
        }

        return amountsIn;
    }

    /**
     * @notice Calculates the return amounts for multiple swaps in case of fixed input amount
     * @param amountIn Amount of tokens provided for the first swap
     * @param pairs Array of uniswap-like pairs
     * @param directions Array of exchange directions (`true` means token0 -> token1)
     * @return amountsOut Amounts returned after the multiple swaps
     * @dev Performs chained getAmountOut calculations
     */
    function getAmountsOut(
        uint256 amountIn,
        address[] memory pairs,
        bool[] memory directions
    ) internal view returns (uint256[] memory amountsOut) {
        uint256 length = pairs.length;

        amountsOut = new uint256[](length + 1);
        amountsOut[0] = amountIn;

        for (uint256 i = 0; i < length; i++) {
            amountsOut[i + 1] = getAmountOut(amountsOut[i], pairs[i], directions[i]);
        }

        return amountsOut;
    }

    /**
     * @notice Calculates the required amount for one swap in case of fixed output amount
     * @param amountOut Amount of the token returned after the swap
     * @param pair Uniswap-like pair
     * @param direction Exchange direction (`true` means token0 -> token1)
     * @return amountIn Amount required for the swap
     * @dev Repeats Uniswap's getAmountIn calculations
     */
    function getAmountIn(
        uint256 amountOut,
        address pair,
        bool direction
    ) internal view returns (uint256 amountIn) {
        if (amountOut == 0) revert ZeroAmountOut();

        (uint256 reserveIn, uint256 reserveOut) = getReserves(pair, direction);
        if (reserveOut < amountOut) revert LowLiquidity(reserveOut, amountOut);

        uint256 numerator = reserveIn * amountOut * 1000;
        uint256 denominator = (reserveOut - amountOut) * 997;

        return (numerator / denominator) + 1;
    }

    /**
     * @notice Calculates the returned amount for one swap in case of fixed input amount
     * @param amountIn Amount of the token provided for the swap
     * @param pair Uniswap-like pair
     * @param direction Exchange direction (`true` means token0 -> token1).
     * @return amountOut Amount returned after the swap
     * @dev Repeats Uniswap's getAmountIn calculations
     */
    function getAmountOut(
        uint256 amountIn,
        address pair,
        bool direction
    ) internal view returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmountIn();

        (uint256 reserveIn, uint256 reserveOut) = getReserves(pair, direction);

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    /**
     * @notice Returns pool's reserves in 'correct' order (input token, output token)
     * @param pair Uniswap-like pair
     * @param direction Exchange direction (`true` means token0 -> token1).
     * @return reserveIn Pool reserve for input token
     * @return reserveOut Pool reserve for output token
     */
    function getReserves(address pair, bool direction)
        internal
        view
        returns (uint256 reserveIn, uint256 reserveOut)
    {
        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        (reserveIn, reserveOut) = direction ? (reserve0, reserve1) : (reserve1, reserve0);

        return (reserveIn, reserveOut);
    }
}
