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
 * @title Abstract contract with basic Ownable functionality and two-step ownership transfer
 */
abstract contract Ownable {
    address private pendingOwner_;
    address private owner_;

    /**
     * @notice Emits old and new pending owners
     * @param oldPendingOwner Old pending owner
     * @param newPendingOwner New pending owner
     */
    event PendingOwnerSet(address indexed oldPendingOwner, address indexed newPendingOwner);

    /**
     * @notice Emits old and new owners
     * @param oldOwner Old contract's owner
     * @param newOwner New contract's owner
     */
    event OwnerSet(address indexed oldOwner, address indexed newOwner);

    modifier onlyPendingOwner() {
        require(msg.sender == pendingOwner_, "O: only pending owner");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner_, "O: only owner");
        _;
    }

    /**
     * @notice Initializes owner variable with msg.sender address
     */
    constructor() {
        emit OwnerSet(address(0), msg.sender);

        owner_ = msg.sender;
    }

    /**
     * @notice Sets pending owner to the `newPendingOwner` address
     * @param newPendingOwner Address of new pending owner
     * @dev The function is callable only by the owner
     */
    function setPendingOwner(address newPendingOwner) external onlyOwner {
        emit PendingOwnerSet(pendingOwner_, newPendingOwner);

        pendingOwner_ = newPendingOwner;
    }

    /**
     * @notice Sets owner to the pending owner
     * @dev The function is callable only by the pending owner
     */
    function setOwner() external onlyPendingOwner {
        emit OwnerSet(owner_, msg.sender);

        owner_ = msg.sender;
        delete pendingOwner_;
    }

    /**
     * @return owner Owner of the contract
     */
    function getOwner() external view returns (address owner) {
        return owner_;
    }

    /**
     * @return pendingOwner Pending owner of the contract
     */
    function getPendingOwner() external view returns (address pendingOwner) {
        return pendingOwner_;
    }
}
