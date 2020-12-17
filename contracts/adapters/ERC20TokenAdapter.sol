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

import { ERC20 } from "../interfaces/ERC20.sol";
import { ERC20Metadata, Component } from "../shared/Structs.sol";
import { TokenAdapter } from "./TokenAdapter.sol";
import { Helpers } from "../shared/Helpers.sol";

/**
 * @title Adapter for ERC20 tokens.
 * @dev Implementation of TokenAdapter abstract contract function.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ERC20TokenAdapter is TokenAdapter {
    using Helpers for bytes32;

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address internal constant CSAI = 0xF5DCe57282A584D2746FaF1593d3121Fcac444dC;

    /**
     * @return Empty Component array.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address) external pure override returns (Component[] memory) {
        return new Component[](0);
    }

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getMetadata(address token) public view override returns (ERC20Metadata memory) {
        if (token == ETH) {
            return ERC20Metadata({ name: "Ether", symbol: "ETH", decimals: uint8(18) });
        } else if (token == SAI) {
            return
                ERC20Metadata({ name: "Sai Stablecoin v1.0", symbol: "SAI", decimals: uint8(18) });
        } else if (token == CSAI) {
            return ERC20Metadata({ name: "Compound Sai", symbol: "cSAI", decimals: uint8(8) });
        } else {
            return super.getMetadata(token);
        }
    }

    /**
     * @dev Internal function to get non-ERC20 token name.
     */
    function getName(address token) internal view override returns (string memory) {
        // solhint-disable-next-line avoid-low-level-calls
        (, bytes memory returnData) =
            token.staticcall(abi.encodeWithSelector(ERC20.name.selector));

        return parseReturnData(returnData);
    }

    /**
     * @dev Internal function to get non-ERC20 token symbol.
     */
    function getSymbol(address token) internal view override returns (string memory) {
        // solhint-disable-next-line avoid-low-level-calls
        (, bytes memory returnData) =
            token.staticcall(abi.encodeWithSelector(ERC20.symbol.selector));

        return parseReturnData(returnData);
    }

    function parseReturnData(bytes memory returnData) internal pure returns (string memory) {
        if (returnData.length == 32 || returnData.length == 4096) {
            bytes32 symbol;
            // solhint-disable-next-line no-inline-assembly
            assembly {
                let free := mload(0x40)
                returndatacopy(free, 0, 32)
                symbol := mload(free)
            }
            return symbol.toString();
        } else {
            return abi.decode(returnData, (string));
        }
    }
}
