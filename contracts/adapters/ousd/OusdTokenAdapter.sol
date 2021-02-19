// Copyright (C) 2021 Zerion Inc. <https://zerion.io>
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

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { ERC20Metadata, Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { OusdVault } from "../../interfaces/OusdVault.sol";
import { OusdToken } from "../../interfaces/OusdToken.sol";

/**
 * @title Token adapter for OUSD Protocol.
 * @dev Implementation of TokenAdapter interface.
 * @author Domen Grabec <domen@originprotocol.com>
 */
contract OusdTokenAdapter is TokenAdapter {
    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address vaultAddress = OusdToken(token).vaultAddress();
        address[] memory trackedAssets = OusdVault(vaultAddress).getAllAssets();
        uint256[] memory redeemOutputs = OusdVault(vaultAddress).calculateRedeemOutputs(1e18);

        uint256 length = trackedAssets.length;
        Component[] memory underlyingTokens = new Component[](length);

        for (uint256 i = 0; i < length; i++) {
            underlyingTokens[i] = Component({
                token: trackedAssets[i],
                rate: int256(redeemOutputs[i])
            });
        }

        return underlyingTokens;
    }
}
