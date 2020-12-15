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
import { ERC20Metadata, Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { CToken } from "../../interfaces/CToken.sol";

/**
 * @title Token adapter for CTokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CompoundTokenAdapter is TokenAdapter {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant CSAI = 0xF5DCe57282A584D2746FaF1593d3121Fcac444dC;

    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            token: getUnderlying(token),
            rate: int256(CToken(token).exchangeRateCurrent())
        });

        return components;
    }

    /**
     * @return ERC20Metadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getMetadata(address token) public view override returns (ERC20Metadata memory) {
        if (token == CSAI) {
            return ERC20Metadata({ name: "Compound Sai", symbol: "cSAI", decimals: uint8(8) });
        } else {
            return super.getMetadata(token);
        }
    }

    /**
     * @dev Internal function to retrieve underlying token.
     */
    function getUnderlying(address token) internal view returns (address) {
        return token == CETH ? ETH : CToken(token).underlying();
    }
}
