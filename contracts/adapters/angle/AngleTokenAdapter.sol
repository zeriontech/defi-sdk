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

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { ERC20 } from "../../ERC20.sol";
import { TokenMetadata, Component } from "../../Structs.sol";


/**
 * @dev Angle StableMasterFront contract interface.
 * The StableMasterFront contract is available here
 * https://github.com/AngleProtocol/angle-core/blob/main/contracts/stableMaster/StableMasterFront.sol
 */
interface StableMasterFront {
    function collateralMap(address) external view returns (
        address,
        address,
        address,
        address,
        uint256,
        uint256
    );
}

/**
 * @dev Angle SanToken contract interface.
 * The SanToken contract is available here
 * https://github.com/AngleProtocol/angle-core/blob/main/contracts/sanToken/SanToken.sol
 */
interface SanToken {
    function poolManager() external view returns (address);
}


/**
 * @title Token adapter for Angle sanToken.
 * @dev Implementation of TokenAdapter abstract contract.
 */
contract AngleTokenAdapter is TokenAdapter {
    address internal constant STABLE_MASTER = 0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87;

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: ERC20(token).name(),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given sanToken.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        address poolManager = SanToken(token).poolManager();
        (address underlyingToken, , , , , uint256 rate) =
            StableMasterFront(STABLE_MASTER).collateralMap(poolManager);

        components[0] = Component({ token: underlyingToken, tokenType: "ERC20", rate: rate });

        return components;
    }
}
