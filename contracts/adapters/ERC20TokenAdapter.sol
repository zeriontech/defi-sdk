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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../shared/ERC20.sol";
import { ERC20Metadata, Component } from "../shared/Structs.sol";
import { TokenAdapter } from "./TokenAdapter.sol";
import { Helpers } from "../shared/Helpers.sol";


/**
 * @title Adapter for ERC20 tokens.
 * @dev Implementation of TokenAdapter abstract contract function.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ERC20TokenAdapter is TokenAdapter("ERC20") {
    using Helpers for bytes32;

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address internal constant CSAI = 0x45A2FDfED7F7a2c791fb1bdF6075b83faD821ddE;

    /**
     * @return Empty Component array.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address) external view override returns (Component[] memory) {
        return new Component[](0);
    }

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getMetadata(address token) public view override returns (ERC20Metadata memory) {
        if (token == ETH) {
            return ERC20Metadata({
                name: "Ether",
                symbol: "ETH",
                decimals: uint8(18)
            });
        } else if (token == SAI) {
            return ERC20Metadata({
                name: "Sai Stablecoin v1.0",
                symbol: "SAI",
                decimals: uint8(18)
            });
        } else if (token == CSAI) {
            return ERC20Metadata({
                name: "Compound Sai",
                symbol: "cSAI",
                decimals: uint8(8)
            });
        } else {
            return super.getMetadata(token);
        }
    }

    /**
     * @dev Internal function to get non-ERC20 token name.
     */
    function getName(address token) internal view override returns (string memory) {
        // solhint-disable-next-line avoid-low-level-calls
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).name.selector)
        );

        if (returnData.length == 32) {
            return abi.decode(returnData, (bytes32)).toString();
        } else {
            return abi.decode(returnData, (string));
        }
    }

    /**
     * @dev Internal function to get non-ERC20 token symbol.
     */
    function getSymbol(address token) internal view override returns (string memory) {
        // solhint-disable-next-line avoid-low-level-calls
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
