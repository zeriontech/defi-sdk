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

pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { OpiumAdapter, OpiumTokenMinter } from "./OpiumHelpers.sol";

import { TokenMetadata, Component } from "../../Structs.sol";

/**
 * @title Token adapter for Opium Position token.
 * @dev Implementation of TokenAdapter interface.
 * @author Ali Nuraldin <ali@opium.team>
 */
contract OpiumTokenAdapter is TokenAdapter, OpiumAdapter {

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: OpiumTokenMinter(token).name(),
            symbol: OpiumTokenMinter(token).symbol(),
            decimals: 0
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        token;
        Component[] memory underlyingTokens = new Component[](0);
        return underlyingTokens;
    }
}
