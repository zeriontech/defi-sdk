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

pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../shared/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


/**
 * @dev PBasicSmartPool contract interface.
 * Only the functions required for PieDAOPieTokenAdapter contract are added.
 * The PBasicSmartPool contract is available here
 * github.com/pie-dao/pie-smart-pools/blob/development/contracts/smart-pools/PBasicSmartPool.sol.
 */
interface PBasicSmartPool {
    function getTokens() external view returns (address[] memory);
    function getBPool() external view returns (address);
}


/**
 * @dev BPool contract interface.
 * Only the functions required for UniswapAdapter contract are added.
 * The BPool contract is available here
 * github.com/balancer-labs/balancer-core/blob/master/contracts/BPool.sol.
 */
interface BPool {
    function getFinalTokens() external view returns (address[] memory);
    function getBalance(address) external view returns (uint256);
    function getNormalizedWeight(address) external view returns (uint256);
}


/**
 * @title Token adapter for Pie pool tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Mick de Graaf <mick@dexlab.io>
 */
contract PieDAOPieTokenAdapter is TokenAdapter {

    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address[] memory tokens = PBasicSmartPool(token).getTokens();
        uint256 totalSupply = ERC20(token).totalSupply();
        BPool bPool = BPool(PBasicSmartPool(token).getBPool());

        Component[] memory components = new Component[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            components[i] = Component({
                token: tokens[i],
                rate: bPool.getBalance(tokens[i]) * 1e18 / totalSupply
            });
        }

        return components;
    }

}