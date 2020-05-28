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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { StringHelpers } from "../../StringHelpers.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for UniswapV2TokenAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function isCToken() external view returns (bool);
}


/**
 * @dev UniswapV2Pair contract interface.
 * Only the functions required for UniswapV2TokenAdapter contract are added.
 * The UniswapV2Pair contract is available here
 * github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2Pair.sol.
 */
interface UniswapV2Pair {
    function token0() external view returns (address);
    function token1() external view returns (address);
}


/**
 * @title Token adapter for Uniswap V2 Pool Tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2TokenAdapter is TokenAdapter("Uniswap V2 Pool Token") {

    using StringHelpers for bytes32;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address[] memory tokens = new address[](2);
        tokens[0] = UniswapV2Pair(token).token0();
        tokens[1] = UniswapV2Pair(token).token1();
        uint256 totalSupply = ERC20(token).totalSupply();
        Component[] memory underlyingComponents = new Component[](2);

        bytes32 underlyingTokenType;
        for (uint256 i = 0; i < 2; i++) {
            try CToken(tokens[i]).isCToken{gas: 2000}() returns (bool) {
                underlyingTokenType = "CToken";
            } catch {
                underlyingTokenType = "ERC20";
            }

            underlyingComponents[i] = Component({
                tokenAddress: tokens[i],
                tokenType: underlyingTokenType,
                rate: ERC20(tokens[i]).balanceOf(token) * 1e18 / totalSupply
            });
        }

        return underlyingComponents;
    }

    /**
     * @return Pool name.
     */
    function getName(address token) internal view override returns (string memory) {
        return string(
            abi.encodePacked(
                getUnderlyingSymbol(UniswapV2Pair(token).token0()),
                "/",
                getUnderlyingSymbol(UniswapV2Pair(token).token1()),
                " Pool"
            )
        );
    }

    function getUnderlyingSymbol(address token) internal view returns (string memory) {
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).symbol.selector)
        );

        if (returnData.length == 32) {
            return abi.decode(returnData, (bytes32)).toString();
        } else {
            return abi.decode(returnData, (string));
        }
    }
}
