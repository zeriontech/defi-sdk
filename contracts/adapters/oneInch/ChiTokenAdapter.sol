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

import { ERC20 } from "../../shared/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { IOneSplit } from "../../interfaces/IOneSplit.sol";

/**
 * @title Token adapter for Chi Gastoken by 1inch.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author 1inch.exchange <info@1inch.exchange>
 */
contract ChiTokenAdapter is TokenAdapter {
    address private constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    IOneSplit private constant ONE_SPLIT = IOneSplit(0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E);

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external override returns (Component[] memory) {
        (uint256 returnAmount, ) = ONE_SPLIT.getExpectedReturn(
            ERC20(token),
            ERC20(ETH_ADDRESS),
            1,
            1,
            0
        );

        Component[] memory components = new Component[](1);

        components[0] = Component({ token: ETH_ADDRESS, rate: int256(returnAmount * 1e18) });

        return components;
    }
}
