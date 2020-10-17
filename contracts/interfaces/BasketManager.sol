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
 * @dev Basset struct.
 * The Basset struct is available here
 * github.com/mstable/mStable-contracts/blob/master/contracts/masset/shared/MassetStructs.sol.
 */
struct Basset {
    address addr;
    uint8 status;
    bool isTransferFeeCharged;
    uint256 ratio;
    uint256 maxWeight;
    uint256 vaultBalance;
}

/**
 * @dev BasketManager contract interface.
 * Only the functions required for MassetTokenAdapter contract are added.
 * The BasketManager contract is available here
 * github.com/mstable/mStable-contracts/blob/master/contracts/masset/BasketManager.sol.
 */
interface BasketManager {
    function getBassets() external view returns (Basset[] memory, uint256);
}
