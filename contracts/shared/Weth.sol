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

pragma solidity 0.8.11;

/**
 * @title Abstract contract storing Wrapped Ether address for the current chain
 */
abstract contract Weth {
    address private immutable weth_;

    /**
     * @notice Sets Wrapped Ether address for the current chain
     * @param weth Wrapped Ether address
     */
    constructor(address weth) {
        weth_ = weth;
    }

    /**
     * @notice Returns Wrapped Ether address for the current chain
     * @return weth Wrapped Ether address
     */
    function getWeth() public view returns (address weth) {
        return weth_;
    }
}
