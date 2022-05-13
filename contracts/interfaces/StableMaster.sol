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

/**
 * @dev Angle StableMaster contract interface.
 * The StableMaster contract is available here
 * https://github.com/AngleProtocol/angle-core/blob/main/contracts/stableMaster/StableMasterFront.sol
 */
interface StableMaster {
    function deposit(
        uint256 amount,
        address user,
        address poolManager
    ) external;

    function withdraw(
        uint256 amount,
        address burner,
        address dest,
        address poolManager
    ) external;
}
