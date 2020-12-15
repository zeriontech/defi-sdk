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
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { MKRAdapter } from "./MakerAdapter.sol";
import { Pot } from "../../interfaces/Pot.sol";

/**
 * @title Token adapter for Chai tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ChaiTokenAdapter is TokenAdapter, MKRAdapter {
    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address) external view override returns (Component[] memory) {
        Pot pot = Pot(POT);

        Component[] memory components = new Component[](1);

        components[0] = Component({
            token: DAI,
            rate: int256(
                mkrRmul(
                    // solhint-disable-next-line not-rely-on-time
                    mkrRmul(mkrRpow(pot.dsr(), block.timestamp - pot.rho(), ONE), pot.chi()),
                    1e18
                )
            )
        });

        return components;
    }
}
