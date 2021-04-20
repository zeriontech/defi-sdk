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

abstract contract Ownable {
    address private pendingOwner_;
    address private owner_;

    event PendingOwnerSet(address indexed previousPendingOwner, address indexed newPendingOwner);
    event OwnerSet(address indexed previousOwner, address indexed newOwner);

    modifier onlyPendingOwner {
        require(msg.sender == pendingOwner_, "O: only pending owner");
        _;
    }

    modifier onlyOwner {
        require(msg.sender == owner_, "O: only owner");
        _;
    }

    /**
     * @notice Initializes owner variable with msg.sender address.
     */
    constructor() {
        emit OwnerSet(address(0), msg.sender);

        owner_ = msg.sender;
    }

    /**
     * @notice Sets pending owner to the `newOwner` address.
     * The function is callable only by the owner.
     */
    function setPendingOwner(address newOwner) external onlyOwner {
        emit PendingOwnerSet(pendingOwner_, newOwner);

        pendingOwner_ = newOwner;
    }

    /**
     * @notice Sets owner to the pending owner.
     * The function is callable only by the pending owner.
     */
    function setOwner() external onlyPendingOwner {
        emit OwnerSet(owner_, msg.sender);

        owner_ = msg.sender;
        delete pendingOwner_;
    }

    /**
     * @return Owner of the contract.
     */
    function getOwner() external view returns (address) {
        return owner_;
    }

    /**
     * @return Pending owner of the contract.
     */
    function getPendingOwner() external view returns (address) {
        return pendingOwner_;
    }
}
