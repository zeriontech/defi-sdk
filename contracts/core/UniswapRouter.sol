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

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import { UniswapV2Router02 } from "../interfaces/UniswapV2Router02.sol";

enum RouterType { Uniswap, SushiSwap }

contract UniswapRouter {
    address internal constant UNISWAP_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address internal constant SUSHISWAP_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

    function swapExactTokensForTokens(
        RouterType routerType,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapExactTokensForTokens.selector,
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            )
        );
    }

    function swapTokensForExactTokens(
        RouterType routerType,
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapTokensForExactTokens.selector,
                amountOut,
                amountInMax,
                path,
                to,
                deadline
            )
        );
    }

    function swapExactETHForTokens(
        RouterType routerType,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapExactETHForTokens.selector,
                amountOutMin,
                path,
                to,
                deadline
            )
        );
    }

    function swapTokensForExactETH(
        RouterType routerType,
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapTokensForExactETH.selector,
                amountOut,
                amountInMax,
                path,
                to,
                deadline
            )
        );
    }

    function swapExactTokensForETH(
        RouterType routerType,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapExactTokensForETH.selector,
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            )
        );
    }

    function swapETHForExactTokens(
        RouterType routerType,
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapETHForExactTokens.selector,
                amountOut,
                path,
                to,
                deadline
            )
        );
    }

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        RouterType routerType,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapExactTokensForTokensSupportingFeeOnTransferTokens.selector,
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            )
        );
    }

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        RouterType routerType,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapExactETHForTokensSupportingFeeOnTransferTokens.selector,
                amountOutMin,
                path,
                to,
                deadline
            )
        );
    }

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        RouterType routerType,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {
        _swap(
            routerType,
            abi.encodeWithSelector(
                UniswapV2Router02.swapExactTokensForETHSupportingFeeOnTransferTokens.selector,
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            )
        );
    }

    function _swap(RouterType routerType, bytes memory callData) internal {
        address callee = routerType == RouterType.Uniswap ? UNISWAP_ROUTER : SUSHISWAP_ROUTER;
        (bool success, bytes memory returnData) = callee.delegatecall(callData);

        assembly {
            if eq(success, 0) {
                revert(add(returnData, 32), returndatasize())
            }
        }
    }
}
