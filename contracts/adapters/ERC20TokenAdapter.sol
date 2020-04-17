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

import { ERC20 } from "../ERC20.sol";
import { TokenMetadata, Component } from "../Structs.sol";
import { TokenAdapter } from "./TokenAdapter.sol";


/**
 * @title Adapter for ERC20 tokens.
 * @dev Implementation of TokenAdapter interface function.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ERC20TokenAdapter is TokenAdapter {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address internal constant CSAI = 0x45A2FDfED7F7a2c791fb1bdF6075b83faD821ddE;

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        if (token == ETH) {
            return TokenMetadata({
                token: ETH,
                name: "Ether",
                symbol: "ETH",
                decimals: uint8(18)
            });
        } else if (token == SAI) {
            return TokenMetadata({
                token: SAI,
                name: "Sai Stablecoin v1.0",
                symbol: "SAI",
                decimals: uint8(18)
            });
        } else if (token == CSAI) {
            return TokenMetadata({
                token: CSAI,
                name: "Compound Sai",
                symbol: "cSAI",
                decimals: uint8(8)
            });
        } else {
            return TokenMetadata({
                token: token,
                name: getName(token),
                symbol: getSymbol(token),
                decimals: ERC20(token).decimals()
            });
        }
    }

    /**
     * @return Empty Component array.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address) external view override returns (Component[] memory) {
        return new Component[](0);
    }

    /**
     * @dev Internal function to get non-ERC20 tokens' names.
     */
    function getName(address token) internal view returns (string memory) {
        // solhint-disable-next-line avoid-low-level-calls
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).name.selector)
        );

        if (returnData.length == 32) {
            return convertToString(abi.decode(returnData, (bytes32)));
        } else {
            return abi.decode(returnData, (string));
        }
    }

    /**
     * @dev Internal function to get non-ERC20 tokens' symbols.
     */
    function getSymbol(address token) internal view returns (string memory) {
        // solhint-disable-next-line avoid-low-level-calls
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).symbol.selector)
        );

        if (returnData.length == 32) {
            return convertToString(abi.decode(returnData, (bytes32)));
        } else {
            return abi.decode(returnData, (string));
        }
    }

    /**
     * @dev Internal function to convert bytes32 to string.
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
