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
import { Basset, BasketManager } from "../../interfaces/BasketManager.sol";
import { ForgeValidator } from "../../interfaces/ForgeValidator.sol";

/**
 * @title Token adapter for Masset.
 * @dev Implementation of TokenAdapter abstract contract.
 */
contract MstableTokenAdapter is TokenAdapter {
    address internal constant BASKET_MANAGER = 0x66126B4aA2a1C07536Ef8E5e8bD4EfDA1FdEA96D;
    address internal constant FORGE_VALIDATOR = 0xbB90D06371030fFa150E463621c22950b212eaa1;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address) external view override returns (Component[] memory) {
        (Basset[] memory bassets, uint256 length) = BasketManager(BASKET_MANAGER).getBassets();
        uint256[] memory rates;
        (, , rates) = ForgeValidator(FORGE_VALIDATOR).calculateRedemptionMulti(1e18, bassets);

        Component[] memory components = new Component[](length);
        for (uint256 i = 0; i < length; i++) {
            components[i] = Component({ token: bassets[i].addr, rate: int256(rates[i]) });
        }

        return components;
    }
}
