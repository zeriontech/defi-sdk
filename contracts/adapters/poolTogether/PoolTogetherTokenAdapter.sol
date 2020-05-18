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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


/**
 * @dev BasePool contract interface.
 * Only the functions required for PoolTogetherTokenAdapter contract are added.
 * The BasePool contract is available here
 * github.com/pooltogether/pooltogether-contracts/blob/master/contracts/BasePool.sol.
 */
interface BasePool {
    function token() external view returns (address);
}


/**
 * @title Token adapter for PoolTogether pools.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract PoolTogetherTokenAdapter is TokenAdapter("Pool together pool") {

    address internal constant SAI_POOL = 0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        Component[] memory underlyingComponents= new Component[](1);

        underlyingComponents[0] = Component({
            token: BasePool(token).token(),
            tokenType: "ERC20",
            rate: 1e18
        });

        return underlyingComponents;
    }

    /**
     * @return Pool name.
     */
    function getName(address token) internal view override returns (string memory) {
        if (token == SAI_POOL) {
            return "SAI pool";
        } else {
            address underlying = BasePool(token).token();
            return string(
                abi.encodePacked(
                    ERC20(underlying).symbol(),
                    " pool"
                )
            );
        }
    }

    /**
     * @return Pool symbol.
     */
    function getSymbol(address) internal view override returns (string memory) {
        return "PLT";
    }

    /**
     * @return Pool decimals.
     */
    function getDecimals(address token) internal view override returns (uint8) {
        return ERC20(BasePool(token).token()).decimals();
    }
}
