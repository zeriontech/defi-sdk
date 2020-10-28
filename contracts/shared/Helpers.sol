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
 * @notice Library helps to convert different types to strings.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
library Helpers {
    /**
     * @dev Internal function to convert bytes32 to string and trim zeroes.
     */
    function toString(bytes32 data) internal pure returns (string memory) {
        uint256 counter = 0;
        for (uint256 i = 0; i < 32; i++) {
            if (data[i] != bytes1(0)) {
                counter++;
            }
        }

        bytes memory result = new bytes(counter);
        counter = 0;
        for (uint256 i = 0; i < 32; i++) {
            if (data[i] != bytes1(0)) {
                result[counter] = data[i];
                counter++;
            }
        }

        return string(result);
    }

    /**
     * @dev Internal function to convert uint256 to string.
     */
    function toString(uint256 data) internal pure returns (string memory) {
        if (data == uint256(0)) {
            return "0";
        }

        uint256 length = 0;

        uint256 dataCopy = data;
        while (dataCopy != 0) {
            length++;
            dataCopy /= 10;
        }

        bytes memory result = new bytes(length);
        dataCopy = data;

        // Here, we have on-purpose underflow cause we need case `i = 0` to be included in the loop
        for (uint256 i = length - 1; i < length; i--) {
            result[i] = bytes1(uint8(48 + (dataCopy % 10)));
            dataCopy /= 10;
        }

        return string(result);
    }

    /**
     * @dev Internal function to convert address to string.
     */
    function toString(address data) internal pure returns (string memory) {
        bytes memory bytesData = abi.encodePacked(data);

        bytes memory result = new bytes(42);
        result[0] = "0";
        result[1] = "x";

        for (uint256 i = 0; i < 20; i++) {
            result[i * 2 + 2] = char(bytesData[i] >> 4); // First char of byte
            result[i * 2 + 3] = char(bytesData[i] & 0x0f); // Second char of byte
        }

        return string(result);
    }

    function char(bytes1 byteChar) internal pure returns (bytes1) {
        uint8 uintChar = uint8(byteChar);
        return uintChar < 10 ? bytes1(uintChar + 48) : bytes1(uintChar + 87);
    }
}
