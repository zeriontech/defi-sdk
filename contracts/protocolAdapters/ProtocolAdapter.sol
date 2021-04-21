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

import { IProtocolAdapter } from "../interfaces/IProtocolAdapter.sol";

/**
 * @title Protocol adapter abstract contract.
 * @dev getBalance() function MUST be implemented.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract ProtocolAdapter is IProtocolAdapter {
    /**
     * @dev MUST return amount of the given token locked on the protocol by the given account.
     * @param token Address of the token to check balance of.
     * @param token Address of the account to check balance of.
     * @return balance Balance of the given token for the given account.
     */
    function getBalance(address token, address account)
        public
        virtual
        override
        returns (int256 balance);
}
