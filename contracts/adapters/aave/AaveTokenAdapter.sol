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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


/**
 * @dev AToken contract interface.
 * Only the functions required for AaveTokenAdapter contract are added.
 * The AToken contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/tokenization/AToken.sol.
 */
interface AToken {
    function underlyingAssetAddress() external view returns (address);
}


/**
 * @title Token adapter for ATokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AaveTokenAdapter is TokenAdapter("AToken") {

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address underlying = AToken(token).underlyingAssetAddress();

        Component[] memory underlyingComponents= new Component[](1);

        underlyingComponents[0] = Component({
            tokenAddress: underlying,
            tokenType: "ERC20",
            rate: uint256(1e18)
        });

        return underlyingComponents;
    }
}
