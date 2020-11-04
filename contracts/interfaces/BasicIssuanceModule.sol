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

/**
 * @dev BasicIssuanceModule contract interface.
 * The BasicIssuanceModule contract is available here
 * etherscan.io/address/0xd8EF3cACe8b4907117a45B0b125c68560532F94D#code.
 */
interface BasicIssuanceModule {
    function issue(
        address,
        uint256,
        address
    ) external;

    function redeem(
        address,
        uint256,
        address
    ) external;
}
