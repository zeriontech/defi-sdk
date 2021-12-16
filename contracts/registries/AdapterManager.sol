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

pragma solidity 0.8.10;

import { IAdapterManager } from "../interfaces/IAdapterManager.sol";
import { ZeroLength } from "../shared/Errors.sol";
import { AdapterNameAndAddress } from "../shared/Structs.sol";
import { Ownable } from "../shared/Ownable.sol";

/**
 * @title Contract responsible for adapters management.
 * @dev Base contract for ProtocolAdapterRegistry and TokenAdaptersRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract AdapterManager is IAdapterManager, Ownable {
    // Adapter's name => adapter's address
    mapping(bytes32 => address) private _adapter;

    /**
     * @inheritdoc IAdapterManager
     */
    function setAdapters(AdapterNameAndAddress[] calldata adaptersNamesAndAddresses)
        external
        override
        onlyOwner
    {
        uint256 length = adaptersNamesAndAddresses.length;
        if (length == 0) {
            revert ZeroLength();
        }

        for (uint256 i = 0; i < length; i++) {
            setAdapter(adaptersNamesAndAddresses[i].name, adaptersNamesAndAddresses[i].adapter);
        }
    }

    /**
     * @inheritdoc IAdapterManager
     */
    function getAdapterAddress(bytes32 name) public view override returns (address adapter) {
        return _adapter[name];
    }

    /**
     * @dev Sets an adapter address.
     * @param name Adapter's name.
     * @param adapter Adapter's address.
     */
    function setAdapter(bytes32 name, address adapter) internal {
        emit AdapterSet(name, _adapter[name], adapter);

        _adapter[name] = adapter;
    }
}
