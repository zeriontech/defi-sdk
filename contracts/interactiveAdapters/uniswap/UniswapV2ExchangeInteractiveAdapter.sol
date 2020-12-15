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

import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount, AmountType } from "../../shared/Structs.sol";
import { UniswapExchangeAdapter } from "../../adapters/uniswap/UniswapExchangeAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { UniswapV2Library } from "./UniswapV2Library.sol";
import { UniswapV2Pair } from "../../interfaces/UniswapV2Pair.sol";

/**
 * @title Interactive adapter for Uniswap V2 protocol (exchange).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2ExchangeInteractiveAdapter is InteractiveAdapter, UniswapExchangeAdapter {
    using SafeERC20 for ERC20;

    address internal constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * "from" token address, "from" token amount, and amount type.
     * @param data ABI-encoded additional parameter:
     *     - path - Uniswap exchange path starting from tokens[0].
     * @return tokensToBeWithdrawn Array with one element - token address to be exchanged to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "Uv2EIA: should be 1 tokenAmount");

        address[] memory path = abi.decode(data, (address[]));
        address token = tokenAmounts[0].token;
        require(token == path[0], "Uv2EIA: bad path[0]");
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = path[path.length - 1];

        uint256[] memory amounts = UniswapV2Library.getAmountsOut(FACTORY, amount, path);

        _swap(amounts, path);
    }

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * "to" token address, "to" token amount, and amount type (must be absolute).
     * @param data Uniswap exchange path ending with tokens[0] (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be changed to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "Uv2EIA: should be 1 tokenAmount");
        require(tokenAmounts[0].amountType == AmountType.Absolute, "Uv2EIA: bad type");

        address[] memory path = abi.decode(data, (address[]));
        address token = tokenAmounts[0].token;
        require(token == path[path.length - 1], "Uv2EIA: bad path[path.length - 1]");
        uint256 amount = tokenAmounts[0].amount;

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = token;

        uint256[] memory amounts = UniswapV2Library.getAmountsIn(FACTORY, amount, path);

        _swap(amounts, path);
    }

    function _swap(uint256[] memory amounts, address[] memory path) internal {
        ERC20(path[0]).safeTransfer(
            UniswapV2Library.pairFor(FACTORY, path[0], path[1]),
            amounts[0],
            "Uv2EIA"
        );

        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = UniswapV2Library.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) =
                input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));

            UniswapV2Pair(UniswapV2Library.pairFor(FACTORY, input, output)).swap(
                amount0Out,
                amount1Out,
                i < path.length - 2
                    ? UniswapV2Library.pairFor(FACTORY, output, path[i + 2])
                    : address(this),
                new bytes(0)
            );
        }
    }
}
