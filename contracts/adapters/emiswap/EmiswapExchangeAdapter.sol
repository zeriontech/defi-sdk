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

pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { ProtocolAdapter } from "../ProtocolAdapter.sol";

/**
 * @title Adapter for Emiswap protocol (exchange).
 * @dev Implementation of ProtocolAdapter abstract contract.
 * Base contract for Emiswap exchange adapter.
 * @author Eugene Rupakov <eugene.rupakov@emirex.com>
 */
contract EmiswapExchangeAdapter is ProtocolAdapter {
    /**
     * @notice This function is unavailable for exchange adapter.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address, address) public override returns (int256) {
        revert("EEA: no balance");
    }
}
