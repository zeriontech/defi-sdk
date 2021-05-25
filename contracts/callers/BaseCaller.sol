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

/**
 * @title Base caller that provides `getAccount` function.
 */
abstract contract BaseCaller {
    /**
     * @notice Fetches `account` address from `msg.data`
     * @return account Address of account that receives the resulting funds.
     */
    function getAccount() internal pure returns (address payable account) {
        // require(msg.data.length > 32, "BC: bad calldata");
        // solhint-disable-next-line no-inline-assembly
        assembly {
            // Type conversion will leave only lase 20 bytes from `calldataload()` call.
            account :=
                // Load last 32 bytes of calldata.
                calldataload(
                    // Calldata size, decreased by 32 bytes (1 slot).
                    sub(
                        calldatasize(),
                        32
                    )
                )
        }

        return account;
    }
}
