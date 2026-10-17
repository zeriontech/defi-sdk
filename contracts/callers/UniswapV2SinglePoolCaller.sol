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

pragma solidity 0.8.12;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ICaller } from "../interfaces/ICaller.sol";
import { IUniswapV2Pair } from "../interfaces/IUniswapV2Pair.sol";
import { IWETH9 } from "../interfaces/IWETH9.sol";
import { Base } from "../shared/Base.sol";
import { SwapType } from "../shared/Enums.sol";
import { BadToken, InconsistentPairsAndDirectionsLengths, InsufficientBalance, LowReserve, ZeroAmountIn, ZeroAmountOut, ZeroLength } from "../shared/Errors.sol";
import { TokensHandler } from "../shared/TokensHandler.sol";
import { Weth } from "../shared/Weth.sol";

/**
 * @title Uniswap caller that executes swaps on UniswapV2-like pools
 */
contract UniswapV2SinglePoolCaller is ICaller, TokensHandler, Weth {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Sets Wrapped Ether address for the current chain
     * @param weth Wrapped Ether address
     */
    constructor(address weth) Weth(weth) {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @notice Main external function:
     *     executes swap using Uniswap-like pools and returns tokens to the account
     * @param callerCallData ABI-encoded parameters:
     *     - inputToken Address of the token that should be spent
     *     - outputToken Address of the token that should be returned
     *     - pair Uniswap V2 like pair
     *     - swapType Whether input or output amount is fixed
     *     - fixedSideAmount Amount of the token which is fixed (see `swapType`)
     * @dev Implementation of Caller interface function
     */
    function callBytes(bytes calldata callerCallData) external override {
        (
            address inputToken,
            address outputToken,
            address pair,
            SwapType swapType,
            uint256 fixedSideAmount
        ) = abi.decode(callerCallData, (address, address, address, SwapType, uint256));

        address inputTokenERC20 = (inputToken == ETH) ? getWeth() : inputToken;
        // Positive direction means `inputTokenERC20 == token0`
        bool direction = (inputTokenERC20 == IUniswapV2Pair(pair).token0());

        (uint256 inputTokenAmount, uint256 outputTokenAmount) = swapType == SwapType.FixedInputs
            ? (fixedSideAmount, getAmountOut(fixedSideAmount, pair, direction))
            : (getAmountIn(fixedSideAmount, pair, direction), fixedSideAmount);

        // Transfer input tokens to the pair
        {
            uint256 balance = Base.getBalance(inputToken);
            if (balance < inputTokenAmount) revert InsufficientBalance(balance, inputTokenAmount);

            if (inputToken == ETH) depositEth(inputTokenAmount);
            SafeERC20.safeTransfer(IERC20(inputTokenERC20), pair, inputTokenAmount);
        }

        // Do the swap via the given pair
        IUniswapV2Pair(pair).swap(
            direction ? uint256(0) : outputTokenAmount,
            direction ? outputTokenAmount : uint256(0),
            (outputToken == ETH) ? address(this) : msg.sender,
            bytes("")
        );

        // Unwrap weth if necessary
        if (outputToken == ETH) withdrawEth();

        // In case of non-zero input token, transfer the remaining amount back to `msg.sender`
        Base.transfer(inputToken, msg.sender, Base.getBalance(inputToken));

        // In case of non-zero output token, transfer the total balance to `msg.sender`
        Base.transfer(outputToken, msg.sender, Base.getBalance(outputToken));
    }

    /**
     * @notice Wraps Ether
     */
    function depositEth(uint256 amount) internal {
        address weth = getWeth();

        if (amount > 0) IWETH9(weth).deposit{ value: amount }();
    }

    /**
     * @notice Unwraps Wrapped Ether (if necessary)
     */
    function withdrawEth() internal {
        address weth = getWeth();
        uint256 wethBalance = IERC20(weth).balanceOf(address(this));
        // The check always passes, however, left for unusual cases
        if (wethBalance > uint256(0)) IWETH9(weth).withdraw(wethBalance);
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
        if (amountOut == uint256(0)) revert ZeroAmountOut();

        (uint256 reserveIn, uint256 reserveOut) = getReserves(pair, direction);
        if (reserveOut < amountOut) revert LowReserve(reserveOut, amountOut);

        uint256 numerator = reserveIn * amountOut * 1000;
        uint256 denominator = (reserveOut - amountOut) * 997;

        return (numerator / denominator) + 1;
    }

    /**
     * @notice Calculates the returned amount for one swap in case of fixed input amount
     * @param amountIn Amount of the token provided for the swap
     * @param pair Uniswap-like pair
     * @param direction Exchange direction (`true` means token0 -> token1)
     * @return amountOut Amount returned after the swap
     * @dev Repeats Uniswap's getAmountIn calculations
     */
    function getAmountOut(
        uint256 amountIn,
        address pair,
        bool direction
    ) internal view returns (uint256 amountOut) {
        if (amountIn == uint256(0)) revert ZeroAmountIn();

        (uint256 reserveIn, uint256 reserveOut) = getReserves(pair, direction);

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    /**
     * @notice Returns pool's reserves in 'correct' order (input token, output token)
     * @param pair Uniswap-like pair
     * @param direction Exchange direction (`true` means token0 -> token1)
     * @return reserveIn Pool reserve for input token
     * @return reserveOut Pool reserve for output token
     */
    function getReserves(
        address pair,
        bool direction
    ) internal view returns (uint256 reserveIn, uint256 reserveOut) {
        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        (reserveIn, reserveOut) = direction ? (reserve0, reserve1) : (reserve1, reserve0);

        return (reserveIn, reserveOut);
    }
}
