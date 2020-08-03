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
 * @dev CToken contract interface.
 * Only the functions required for UniswapV1TokenAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function isCToken() external view returns (bool);
}


/**
 * @dev SetToken contract interface.
 * Only the functions required for TokenSetsTokenAdapter contract are added.
 * The SetToken contract is available here
 * github.com/SetProtocol/set-protocol-contracts/blob/master/contracts/core/tokens/SetToken.sol.
 */
interface SetToken {
    function getUnits() external view returns (uint256[] memory);
    function naturalUnit() external view returns (uint256);
    function getComponents() external view returns(address[] memory);
}


/**
 * @dev RebalancingSetToken contract interface.
 * Only the functions required for TokenSetsTokenAdapter contract are added.
 * The RebalancingSetToken contract is available here
 * github.com/SetProtocol/set-protocol-contracts/blob/master/contracts/core/tokens/RebalancingSetTokenV3.sol.
 */
interface RebalancingSetToken {
    function unitShares() external view returns (uint256);
    function naturalUnit() external view returns (uint256);
    function currentSet() external view returns (address);
}


/**
 * @title Token adapter for TokenSets.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenSetsTokenAdapter is TokenAdapter {

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        RebalancingSetToken rebalancingSetToken = RebalancingSetToken(token);
        uint256 rebalancingUnitShare = rebalancingSetToken.unitShares();
        uint256 rebalancingNaturalUnit = rebalancingSetToken.naturalUnit();
        uint256 rebalancingRate = 1e18 / rebalancingNaturalUnit * rebalancingUnitShare;

        SetToken baseSetToken = SetToken(rebalancingSetToken.currentSet());
        uint256[] memory baseUnitShares = baseSetToken.getUnits();
        uint256 baseNaturalUnit = baseSetToken.naturalUnit();
        address[] memory baseComponents = baseSetToken.getComponents();

        Component[] memory components = new Component[](baseComponents.length);

        for (uint256 i = 0; i < baseComponents.length; i++) {
            components[i] = Component({
                token: baseComponents[i],
                rate: rebalancingRate / baseNaturalUnit * baseUnitShares[i]
            });
        }

        return components;
    }
}
