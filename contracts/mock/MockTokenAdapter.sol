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

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { TokenMetadata, Component } from "../Structs.sol";
import { TokenAdapter } from "../adapters/TokenAdapter.sol";


/**
 * @notice Mock token adapter for tests.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract MockTokenAdapter is TokenAdapter {

    /**
      * @return TokenMetadata struct with ERC20-style token info.
      * @dev Implementation of TokenAdapter interface function.
      */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: "Mock",
            symbol: "MCK",
            decimals: 18
        });
    }

    /**
     * @return Empty Component array.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address) external view override returns (Component[] memory) {
        return new Component[](0);
    }
}
