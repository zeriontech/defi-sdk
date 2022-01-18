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

pragma solidity 0.8.11;

import { Fee } from "../shared/Structs.sol";

interface IProtocolFee {
    /**
     * @notice Sets protocol fee default value
     * @param protocolFeeDefault New base fee defaul value
     * @dev Can be called only by the owner
     */
    function setProtocolFeeDefault(Fee calldata protocolFeeDefault) external;

    /**
     * @notice Sets protocol fee signature signer
     * @param signer New signer
     * @dev Can be called only by the owner
     */
    function setProtocolFeeSigner(address signer) external;

    /**
     * @notice Returns current protocol fee default value
     * @return protocolFeeDefault Protocol fee consisting of its share and beneficiary
     */
    function getProtocolFeeDefault() external view returns (Fee memory protocolFeeDefault);

    /**
     * @notice Returns current protocol fee signature signer
     * @return signer Current signer address
     */
    function getProtocolFeeSigner() external view returns (address signer);
}
