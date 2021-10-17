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

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { IStakingPools } from "../../interfaces/IStakingPools.sol";

/**
 * @title DHV Staking adapter for DeHive protocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 */
contract StakingDHVAdapter is ProtocolAdapter {
    /**
     * @dev MUST return amount and type of the given token
     * locked on the protocol by the given account.
     * @param token DHV address
     * @param account User's account
     */
    function getBalance(address token, address account) public override view returns (int256) {
        address STAKING_DHV_ETH = address(0x04595f9010F79422a9b411ef963e4dd1F7107704);
        address DHV_TOKEN_ETH = address(0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A);
        
        address STAKING_DHV_POLY = address(0x88cFC1bc9aEb80f6C8f5d310d6C3761c2a646Df7);
        address DHV_TOKEN_POLY = address(0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26);

        uint256 amount = 0;
        if (token == DHV_TOKEN_ETH) {
            amount = IStakingPools(STAKING_DHV_ETH).userInfo(0, account);
        }
        else if (token == DHV_TOKEN_POLY) {
            amount = IStakingPools(STAKING_DHV_POLY).userInfo(0, account);
        }
        return int256(amount);
    }
}