// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.12;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IUniswapV3Pool } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import { IWETH9 } from "../interfaces/IWETH9.sol";
import { Base } from "../shared/Base.sol";
import { TokensHandler } from "../shared/TokensHandler.sol";
import { Weth } from "../shared/Weth.sol";
// solhint-disable-next-line
import { CallbackValidation } from "./helpers/uniswap/CallbackValidation.sol";
import { TickMath } from "./helpers/uniswap/TickMath.sol";
// solhint-disable-next-line
import { IUniswapV3SwapCallback } from "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";
import { Path } from "./helpers/uniswap/Path.sol";

contract UniswapV3Caller is TokensHandler, Weth {
    using Path for bytes;

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    struct SwapCallbackData {
        bytes path;
        address payer;
    }

    constructor(address _weth) Weth(_weth) {}

    function callBytes(bytes calldata callerCallData) external {
        (
            address inputToken,
            address outputToken,
            address pool,
            uint256 fixedSideAmount,
            bool isExactInput
        ) = abi.decode(callerCallData, (address, address, address, uint256, bool));

        if (inputToken == ETH) {
            depositEth(fixedSideAmount);
        }

        if (isExactInput) {
            exactInputSwap(inputToken, outputToken, pool, fixedSideAmount);
        } else {
            exactOutputSwap(inputToken, outputToken, pool, fixedSideAmount);
        }

        // Unwrap weth if necessary
        if (outputToken == ETH) withdrawEth();

        // In case of non-zero input token, transfer the remaining amount back to `msg.sender`
        Base.transfer(inputToken, msg.sender, Base.getBalance(inputToken));

        // In case of non-zero output token, transfer the total balance to `msg.sender`
        Base.transfer(outputToken, msg.sender, Base.getBalance(outputToken));
    }

    function exactInputSwap(
        address inputToken,
        address outputToken,
        address pool,
        uint256 amountIn
    ) internal {
        IUniswapV3Pool v3Pool = IUniswapV3Pool(pool);

        SafeERC20.safeApprove(IERC20(inputToken), pool, amountIn);

        (int256 amount0, int256 amount1) = v3Pool.swap(
            address(this),
            inputToken < outputToken,
            int256(amountIn),
            inputToken < outputToken ? TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1,
            abi.encode(inputToken, outputToken)
        );
    }

    function exactOutputSwap(
        address inputToken,
        address outputToken,
        address pool,
        uint256 amountOut
    ) internal {
        IUniswapV3Pool v3Pool = IUniswapV3Pool(pool);

        (int256 amount0, int256 amount1) = v3Pool.swap(
            address(this),
            inputToken < outputToken,
            -int256(amountOut),
            inputToken < outputToken ? TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1,
            abi.encode(inputToken, outputToken)
        );
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        SwapCallbackData memory callbackData = abi.decode(data, (SwapCallbackData));
        (address tokenIn, address tokenOut, ) = callbackData.path.decodeFirstPool();

        (bool isExactInput, uint256 amountToPay) = amount0Delta > 0
            ? (tokenIn < tokenOut, uint256(amount0Delta))
            : (tokenOut < tokenIn, uint256(amount1Delta));

        if (isExactInput) {
            Base.transfer(tokenIn, msg.sender, amountToPay);
        } else {
            Base.transfer(tokenOut, msg.sender, amountToPay);
        }
    }

    function depositEth(uint256 amount) internal {
        IWETH9(getWeth()).deposit{ value: amount }();
    }

    function withdrawEth() internal {
        uint256 wethBalance = IERC20(getWeth()).balanceOf(address(this));
        if (wethBalance > uint256(0)) IWETH9(getWeth()).withdraw(wethBalance);
    }
}
