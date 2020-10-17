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

/**
 * @dev Info struct from Account library.
 * The Account library is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/lib/Account.sol.
 */
struct Info {
    address owner; // The address that owns the account
    uint256 number; // A nonce that allows a single address to control many accounts
}

/**
 * @dev Wei struct from Types library.
 * The Types library is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/lib/Types.sol.
 */
struct Wei {
    bool sign; // true if positive
    uint256 value;
}

/**
 * @dev SoloMargin contract interface.
 * Only the functions required for DyDxAssetAdapter contract are added.
 * The SoloMargin contract is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/SoloMargin.sol.
 */
interface SoloMargin {
    function getAccountWei(Info calldata, uint256) external view returns (Wei memory);
}
