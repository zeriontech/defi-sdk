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
 * Only the functions required for UniswapV1TokenAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function isCToken() external view returns (bool);
}


/**
 * @dev Exchange contract interface.
 * Only the functions required for UniswapV1TokenAdapter contract are added.
 * The Exchange contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy.
 */
interface Exchange {
    function name() external view returns (bytes32);
    function symbol() external view returns (bytes32);
    function decimals() external view returns (uint256);
}


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapV1TokenAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getToken(address) external view returns (address);
}


/**
 * @title Token adapter for Uniswap V1 Pool Tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV1TokenAdapter is TokenAdapter("Uniswap V1 Pool Token") {

    using StringHelpers for bytes32;

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SAI_POOL = 0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14;
    address internal constant CSAI_POOL = 0x45A2FDfED7F7a2c791fb1bdF6075b83faD821ddE;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address underlyingToken = Factory(FACTORY).getToken(token);
        uint256 totalSupply = ERC20(token).totalSupply();
        bytes32 underlyingTokenType;
        Component[] memory underlyingComponents= new Component[](2);

        underlyingComponents[0] = Component({
            tokenAddress: ETH,
            tokenType: "ERC20",
            rate: token.balance * 1e18 / totalSupply
        });

        try CToken(underlyingToken).isCToken{gas: 2000}() returns (bool) {
            underlyingTokenType = "CToken";
        } catch {
            underlyingTokenType = "ERC20";
        }

        underlyingComponents[1] = Component({
            tokenAddress: underlyingToken,
            tokenType: underlyingTokenType,
            rate: ERC20(underlyingToken).balanceOf(token) * 1e18 / totalSupply
        });

        return underlyingComponents;
    }

    /**
     * @return Pool name.
     */
    function getName(address token) internal view override returns (string memory) {
        if (token == SAI_POOL) {
            return "SAI Pool";
        } else if (token == CSAI_POOL) {
            return "cSAI Pool";
        } else {
            return string(
                abi.encodePacked(
                    getUnderlyingSymbol(Factory(FACTORY).getToken(token)),
                    " Pool"
                )
            );
        }
    }

    /**
     * @return Pool symbol.
     */
    function getSymbol(address) internal view override returns (string memory) {
        return "UNI-V1";
    }

    /**
     * @return Pool decimals.
     */
    function getDecimals(address token) internal view override returns (uint8) {
        return uint8(Exchange(token).decimals());
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
