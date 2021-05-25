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

pragma solidity 0.8.4;

import { IAdapterManager } from "../interfaces/IAdapterManager.sol";
import { Ownable } from "../shared/Ownable.sol";

/**
 * @title Contract responsible for adapters management.
 * @dev Base contract for ProtocolAdapterRegistry and TokenAdaptersRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract AdapterManager is IAdapterManager, Ownable {
    // Adapter's name => adapter's address
    mapping(bytes32 => address) private _adapterAddress;

    /**
     * @notice Sets adapters (adds, updates or removes).
     * @param adapterNames Array of the new adapters' names.
     * @param newAdapterAddresses Array of the new adapters' addresses.
     * @dev Can be called only by this contract's owner.
     */
    function setAdapters(bytes32[] calldata adapterNames, address[] calldata newAdapterAddresses)
        external
        override
        onlyOwner
    {
        uint256 length = adapterNames.length;
        require(length != 0, "AM: empty");
        require(length == newAdapterAddresses.length, "AM: lengths differ");

        for (uint256 i = 0; i < length; i++) {
            setAdapter(adapterNames[i], newAdapterAddresses[i]);
        }
    }

    /**
     * @param adapterName Name of the adapter.
     * @return Address of adapter.
     */
    function getAdapterAddress(bytes32 adapterName) public view override returns (address) {
        return _adapterAddress[adapterName];
    }

    /**
     * @dev Sets an adapter.
     * @param adapterName Adapter's name.
     * @param newAdapterAddress New adapter's address.
     */
    function setAdapter(bytes32 adapterName, address newAdapterAddress) internal {
        emit AdapterSet(adapterName, _adapterAddress[adapterName], newAdapterAddress);

        _adapterAddress[adapterName] = newAdapterAddress;
    }
}
