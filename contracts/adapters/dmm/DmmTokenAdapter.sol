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

/**
 * @dev IDmmToken contract interface.
 * Only the functions required for DmmTokenAdapter contract are added.
 * The IDmmToken contract is available here
 * github.com/defi-money-market-ecosystem/protocol/blob/master/contracts/interfaces/IDmmController.sol.
 */
interface IDmmController {
    function getUnderlyingTokenForDmm(address dmmToken) external view returns (address);

    function getExchangeRate(address dmmToken) external view returns (uint256);
}

/**
 * @dev IDmmToken contract interface.
 * Only the functions required for DmmTokenAdapter contract are added.
 * The IDmmToken contract is available here
 * github.com/defi-money-market-ecosystem/protocol/blob/master/contracts/interfaces/IDmmToken.sol.
 */
interface IDmmToken {
    function controller() external view returns (IDmmController);
}

/**
 * @title Token adapter for IDmmTokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Corey Caplan <corey@dolomite.io>
 */
contract DmmTokenAdapter is TokenAdapter {
    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            token: IDmmToken(token).controller().getUnderlyingTokenForDmm(token),
            rate: int256(IDmmToken(token).controller().getExchangeRate(token))
        });

        return components;
    }
}
