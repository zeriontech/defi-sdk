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

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { Hydro } from "../../interfaces/Hydro.sol";

/**
 * @title Asset adapter for DDEX protocol (spot account).
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract DdexSpotAssetAdapter is ProtocolAdapter {
    address internal constant HYDRO = 0x241e82C79452F51fbfc89Fac6d912e021dB1a3B7;
    address internal constant HYDRO_ETH = 0x000000000000000000000000000000000000000E;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @return Amount of tokens held by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address token, address account) public override returns (int256) {
        return int256(Hydro(HYDRO).balanceOf(token == ETH ? HYDRO_ETH : token, account));
    }
}
