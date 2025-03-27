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

pragma solidity 0.8.12;

/**
 * @title Abstract contract storing Universal Router & Permit2 addresses for the current chain
 */
abstract contract Permit2 {
    address private immutable UNIVERSAL_ROUTER;
    address private immutable PERMIT2;

    /**
     * @notice Sets Wrapped Ether address for the current chain
     * @param universalRouter Universal Router address
     * @param permit2 Permit2 address
     */
    constructor(address universalRouter, address permit2) {
        UNIVERSAL_ROUTER = universalRouter;
        PERMIT2 = permit2;
    }

    /**
     * @notice Returns Universal Router address for the current chain
     * @return universalRouter Universal Router address
     */
    function getUniversalRouter() public view returns (address universalRouter) {
        return UNIVERSAL_ROUTER;
    }

    /**
     * @notice Returns Permit2 address for the current chain
     * @return permit2 Permit2 address
     */
    function getPermit2() public view returns (address permit2) {
        return PERMIT2;
    }
}
