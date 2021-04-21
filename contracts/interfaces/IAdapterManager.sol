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

pragma solidity 0.8.1;

/**
 * @title Contract responsible for adapters management.
 * @dev Interface for ProtocolAdapterRegistry and TokenAdaptersRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
interface IAdapterManager {
    /**
     * @notice Emits old and new adapter addersses.
     * @param adapterName Adapter's name.
     * @param oldAdapterAddress Old adapter's address.
     * @param newAdapterAddress New adapter's address.
     */
    event AdapterSet(
        bytes32 indexed adapterName,
        address indexed oldAdapterAddress,
        address indexed newAdapterAddress
    );

    /**
     * @notice Sets adapters (adds, updates or removes).
     * @param adapterNames Array of the new adapters' names.
     * @param newAdapterAddresses Array of the new adapters' addresses.
     * @dev Can be called only by this contract's owner.
     */
    function setAdapters(bytes32[] calldata adapterNames, address[] calldata newAdapterAddresses)
        external;

    /**
     * @param adapterName Name of the adapter.
     * @return Address of adapter.
     */
    function getAdapterAddress(bytes32 adapterName) external view returns (address);
}
