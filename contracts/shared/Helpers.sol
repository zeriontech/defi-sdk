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
}
