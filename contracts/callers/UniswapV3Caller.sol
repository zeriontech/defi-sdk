// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.12;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IUniswapV3SwapCallback } from "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";
import { IUniswapV3Pool } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import { IWETH9 } from "./../interfaces/IWETH9.sol";
import { Base } from "./../shared/Base.sol";
import { TokensHandler } from "./../shared/TokensHandler.sol";
import { Weth } from "./../shared/Weth.sol";

contract UniswapV3Caller is TokensHandler, Weth, IUniswapV3SwapCallback {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint160 internal constant MIN_SQRT_RATIO = 4295128739;
    uint160 internal constant MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;

    /**
     * @notice Sets Wrapped Ether address for the current chain
     * @param weth Wrapped Ether address
     */
    constructor(address weth) Weth(weth) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function callBytes(bytes calldata callerCallData) external {
        (
            address inputToken,
            address outputToken,
            address pool,
            bool direction,
            uint256 fixedSideAmount,
            bool isExactInput
        ) = abi.decode(callerCallData, (address, address, address, bool, uint256, bool));

        if (isExactInput) {
            exactInputSwap(inputToken, pool, direction, fixedSideAmount);
        } else {
            exactOutputSwap(inputToken, pool, direction, fixedSideAmount);
        }

        // Unwrap weth if necessary
        if (outputToken == ETH) withdrawEth();

        // In case of non-zero input token, transfer the remaining amount back to `msg.sender`
        Base.transfer(inputToken, msg.sender, Base.getBalance(inputToken));

        // In case of non-zero output token, transfer the total balance to `msg.sender`
        Base.transfer(outputToken, msg.sender, Base.getBalance(outputToken));
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        address inputToken = abi.decode(data, (address));

        if (amount0Delta > 0) {
            if (inputToken == ETH) {
                depositEth(uint256(amount0Delta));
            }
            Base.transfer(IUniswapV3Pool(msg.sender).token0(), msg.sender, uint256(amount0Delta));
        } else {
            if (inputToken == ETH) {
                depositEth(uint256(amount1Delta));
            }
            Base.transfer(IUniswapV3Pool(msg.sender).token1(), msg.sender, uint256(amount1Delta));
        }
    }

    function exactInputSwap(
        address inputToken,
        address pool,
        bool direction,
        uint256 amountIn
    ) internal {
        IUniswapV3Pool(pool).swap(
            address(this),
            direction,
            int256(amountIn),
            direction ? MIN_SQRT_RATIO + 1 : MAX_SQRT_RATIO - 1,
            abi.encode(inputToken)
        );
    }

    function exactOutputSwap(
        address inputToken,
        address pool,
        bool direction,
        uint256 amountOut
    ) internal {
        IUniswapV3Pool(pool).swap(
            address(this),
            direction,
            -int256(amountOut),
            direction ? MIN_SQRT_RATIO + 1 : MAX_SQRT_RATIO - 1,
            abi.encode(inputToken)
        );
    }

    function depositEth(uint256 amount) internal {
        IWETH9(getWeth()).deposit{ value: amount }();
    }

    function withdrawEth() internal {
        uint256 wethBalance = IERC20(getWeth()).balanceOf(address(this));
        if (wethBalance > uint256(0)) IWETH9(getWeth()).withdraw(wethBalance);
    }
}
