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

import { UniswapV2Pair } from "../interfaces/UniswapV2Pair.sol";
import { WETH9 } from "../interfaces/WETH9.sol";
import { ERC20 } from "../interfaces/ERC20.sol";
import { SafeERC20 } from "../shared/SafeERC20.sol";
import { BaseRouter } from "./BaseRouter.sol";
import { Input, Fee } from "../shared/Structs.sol";

enum FactoryType { None, Uniswap, SushiSwap }

contract UniswapRouter is BaseRouter {
    using SafeERC20 for ERC20;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal constant UNISWAP_FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address internal constant SUSHISWAP_FACTORY = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;

    modifier ensure(uint256 deadline) {
        // solhint-disable-next-line not-rely-on-time
        require(deadline >= block.timestamp, "UR: expired");
        _;
    }

    function swapExactTokensForTokens(
        Input memory input,
        Fee memory fee,
        FactoryType factoryType,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) {
        require(path[0] == input.tokenAmount.token, "UR: bad path");

        address factory = getFactory(factoryType);
        uint256 inputAmount =
            handleTokenInput(msg.sender, pairFor(factory, path[0], path[1]), input, fee);

        uint256[] memory amounts = getAmountsOut(factory, inputAmount, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "UR: bad output");

        _swap(factory, amounts, path, to);
    }

    function swapExactETHForTokens(
        Fee memory fee,
        FactoryType factoryType,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable ensure(deadline) {
        require(path[0] == WETH, "UR: bad path");

        address factory = getFactory(factoryType);
        // Here we use WETH fallback that calls deposit() function
        uint256 inputAmount = handleETHInput(msg.sender, WETH, fee);

        uint256[] memory amounts = getAmountsOut(factory, inputAmount, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "UR: bad output");

        ERC20(WETH).safeTransfer(pairFor(factory, path[0], path[1]), inputAmount, "UR");

        _swap(factory, amounts, path, to);
    }

    function swapExactTokensForETH(
        Input memory input,
        Fee memory fee,
        FactoryType factoryType,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) {
        require(path[0] == input.tokenAmount.token, "UR: bad path[1]");
        require(path[path.length - 1] == WETH, "UR: bad path[2]");

        address factory = getFactory(factoryType);
        uint256 inputAmount =
            handleTokenInput(msg.sender, pairFor(factory, path[0], path[1]), input, fee);

        uint256[] memory amounts = getAmountsOut(factory, inputAmount, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "UR: bad output");

        _swap(factory, amounts, path, address(this));

        WETH9(WETH).withdraw(amounts[amounts.length - 1]);
        transferEther(to, amounts[amounts.length - 1], "UR");
    }

    function _swap(
        address factory,
        uint256[] memory amounts,
        address[] memory path,
        address _to
    ) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) =
                input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            address to = i < path.length - 2 ? pairFor(factory, output, path[i + 2]) : _to;
            UniswapV2Pair(pairFor(factory, input, output)).swap(
                amount0Out,
                amount1Out,
                to,
                new bytes(0)
            );
        }
    }

    function pairFor(
        address factory,
        address tokenA,
        address tokenB
    ) internal pure returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(
            uint256(
                keccak256(
                    abi.encodePacked(
                        hex"ff",
                        factory,
                        keccak256(abi.encodePacked(token0, token1)),
                        hex"96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f" // init code hash
                    )
                )
            )
        );
    }

    function getReserves(
        address factory,
        address tokenA,
        address tokenB
    ) internal view returns (uint256 reserveA, uint256 reserveB) {
        (address token0, ) = sortTokens(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1, ) =
            UniswapV2Pair(pairFor(factory, tokenA, tokenB)).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountOut) {
        require(amountIn > 0, "UR: bad input");
        require(reserveIn > 0 && reserveOut > 0, "UR: low loquidity");
        uint256 amountInWithFee = mul_(amountIn, 997);
        uint256 numerator = mul_(amountInWithFee, reserveOut);
        uint256 denominator = add_(mul_(reserveIn, 1000), amountInWithFee);
        amountOut = numerator / denominator;
    }

    // performs chained getAmountOut calculations on any number of pairs
    function getAmountsOut(
        address factory,
        uint256 amountIn,
        address[] memory path
    ) internal view returns (uint256[] memory) {
        require(path.length >= 2, "UR: bad path");
        uint256[] memory amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        uint256 length = path.length - 1;
        for (uint256 i = 0; i < length; i++) {
            (uint256 reserveIn, uint256 reserveOut) = getReserves(factory, path[i], path[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }

        return amounts;
    }

    function sortTokens(address tokenA, address tokenB)
        internal
        pure
        returns (address token0, address token1)
    {
        require(tokenA != tokenB, "UR: bad tokens");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UR: zero token");
    }

    function getFactory(FactoryType factoryType) internal pure returns (address) {
        return factoryType == FactoryType.Uniswap ? UNISWAP_FACTORY : SUSHISWAP_FACTORY;
    }
}
