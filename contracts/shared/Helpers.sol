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
    // /**
    //  * @dev Internal function to convert bytes4 to string.
    //  * @dev Commented out due to possible bug in the compiler.
    //  */
    // function toString(bytes4 data) internal pure returns (string memory) {
    //     bytes memory result = new bytes(4);

    //     for (uint256 i = 0; i < 4; i++) {
    //         result[i] = char(data[i]);
    //     }

    //     return string(result);
    // }

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

        for (uint256 i = length; i > 0; i--) {
            result[i - 1] = bytes1(uint8(48 + (dataCopy % 10)));
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

    function parseRevertReason(bytes memory data, string memory location)
        internal
        pure
        returns (string memory)
    {
        // https://solidity.readthedocs.io/en/latest/control-structures.html#revert
        // We assume that revert reason is abi-encoded as Error(string)

        // 68 = 4-byte selector 0x08c379a0 + 32 bytes offset + 32 bytes length
        if (
            data.length >= 68 &&
            data[0] == "\x08" &&
            data[1] == "\xc3" &&
            data[2] == "\x79" &&
            data[3] == "\xa0"
        ) {
            string memory reason;
            // solhint-disable no-inline-assembly
            assembly {
                // 68 = 32 bytes data length + 4-byte selector + 32 bytes offset
                reason := add(data, 68)
            }
            /*
                revert reason is padded up to 32 bytes with ABI encoder: Error(string)
                also sometimes there is extra 32 bytes of zeros padded in the end:
                https://github.com/ethereum/solidity/issues/10170
                because of that we can't check for equality and instead check
                that string length + extra 68 bytes is less than overall data length
            */
            require(data.length >= 68 + bytes(reason).length, "Invalid revert reason");
            return string(abi.encodePacked(location, reason));
        }
        // 36 = 4-byte selector 0x4e487b71 + 32 bytes integer
        else if (
            data.length == 36 &&
            data[0] == "\x4e" &&
            data[1] == "\x48" &&
            data[2] == "\x7b" &&
            data[3] == "\x71"
        ) {
            uint256 code;
            // solhint-disable no-inline-assembly
            assembly {
                // 36 = 32 bytes data length + 4-byte selector
                code := mload(add(data, 36))
            }
            return string(abi.encodePacked("Panic(", location, toString(code), ")"));
        }

        return string(abi.encodePacked("Unknown(", location, ")"));
    }
}
