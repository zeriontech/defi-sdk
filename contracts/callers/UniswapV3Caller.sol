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
import { CallbackValidation } from "@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol";
import { TickMath } from "@uniswap/v3-core/contracts/libraries/TickMath.sol";
// solhint-disable-next-line
import { UniswapV3Swap } from "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";

contract UniswapV3Caller is TokensHandler, Weth {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

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
            inputToken = getWeth();
        }

        if (isExactInput) {
            exactInputSwap(inputToken, outputToken, pool, fixedSideAmount);
        } else {
            exactOutputSwap(inputToken, outputToken, pool, fixedSideAmount);
        }

        if (outputToken == ETH) {
            withdrawEth();
            Base.transfer(ETH, msg.sender, Base.getBalance(ETH));
        } else {
            Base.transfer(outputToken, msg.sender, Base.getBalance(outputToken));
        }

        if (inputToken != ETH) {
            Base.transfer(inputToken, msg.sender, Base.getBalance(inputToken));
        }
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
            inputToken < outputToken ? -TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1,
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

        int256 amountInMaximum = int256(
            calculateMaxInput(inputToken, outputToken, pool, amountOut)
        );

        SafeERC20.safeApprove(IERC20(inputToken), pool, uint256(amountInMaximum));

        (int256 amount0, int256 amount1) = v3Pool.swap(
            address(this),
            inputToken < outputToken,
            -int256(amountOut),
            inputToken < outputToken ? -TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1,
            abi.encode(inputToken, outputToken)
        );

        // Refund any excess tokens
        uint256 refundAmount = uint256(
            amountInMaximum - (inputToken < outputToken ? amount0 : amount1)
        );
        if (refundAmount > 0) {
            SafeERC20.safeTransfer(IERC20(inputToken), msg.sender, refundAmount);
        }
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        (address inputToken, address outputToken) = abi.decode(data, (address, address));

        if (amount0Delta > 0) {
            SafeERC20.safeTransfer(IERC20(inputToken), msg.sender, uint256(amount0Delta));
        } else {
            SafeERC20.safeTransfer(IERC20(outputToken), msg.sender, uint256(amount1Delta));
        }
    }

    function calculateMaxInput(
        address inputToken,
        address outputToken,
        address pool,
        uint256 amountOut
    ) internal view returns (uint256 memory maxInput) {
        IUniswapV3Pool v3Pool = IUniswapV3Pool(pool);

        (uint160 sqrtRatioX96, , , , , , ) = v3Pool.slot0();
        uint256 price = (sqrtRatioX96 * sqrtRatioX96) / (2 ** 96);

        if (inputToken < outputToken) {
            return (amountOut * price) / 1e18;
        } else {
            return (amountOut * 1e18) / price;
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
