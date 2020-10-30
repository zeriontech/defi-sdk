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

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


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
    function getReserves() external view returns (uint256, uint256);
}


/**
 * @title Token adapter for Uniswap V2 pool tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2TokenAdapter is TokenAdapter {

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: getPoolName(token),
            symbol: "UNI-V2",
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address token0 = UniswapV2Pair(token).token0();
        address token1 = UniswapV2Pair(token).token1();
        uint256 totalSupply = ERC20(token).totalSupply();
        (uint256 reserve0, uint256 reserve1) = UniswapV2Pair(token).getReserves();

        Component[] memory underlyingTokens = new Component[](2);

        underlyingTokens[0] = Component({
            token: token0,
            tokenType: getTokenType(token0),
            rate: totalSupply == 0 ? 0 : reserve0 * 1e18 / totalSupply
        });
        underlyingTokens[1] = Component({
            token: token1,
            tokenType: getTokenType(token1),
            rate: totalSupply == 0 ? 0 : reserve1 * 1e18 / totalSupply
        });

        return underlyingTokens;
    }

    function getPoolName(address token) internal view returns (string memory) {
        return string(
            abi.encodePacked(
                getSymbol(UniswapV2Pair(token).token0()),
                "/",
                getSymbol(UniswapV2Pair(token).token1()),
                " Pool"
            )
        );
    }

    function getSymbol(address token) internal view returns (string memory) {
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).symbol.selector)
        );

        if (returnData.length == 32) {
            return convertToString(abi.decode(returnData, (bytes32)));
        } else {
            return abi.decode(returnData, (string));
        }
    }

    function getTokenType(address token) internal view returns (string memory) {
        (bool success, bytes memory returnData) = token.staticcall{gas: 2000}(
            abi.encodeWithSelector(CToken(token).isCToken.selector)
        );

        if (success) {
            if (returnData.length == 32) {
                return abi.decode(returnData, (bool)) ? "CToken" : "ERC20";
            } else {
                return "ERC20";
            }
        } else {
            return "ERC20";
        }
    }

    /**
     * @dev Internal function to convert bytes32 to string and trim zeroes.
     */
    function convertToString(bytes32 data) internal pure returns (string memory) {
        uint256 length = 0;
        bytes memory result;

        for (uint256 i = 0; i < 32; i++) {
            if (data[i] != byte(0)) {
                length++;
            }
        }

        result = new bytes(length);

        for (uint256 i = 0; i < length; i++) {
            result[i] = data[i];
        }

        return string(result);
    }
}
