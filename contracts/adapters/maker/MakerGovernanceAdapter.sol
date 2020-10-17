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

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { DSChief } from "../../interfaces/DSChief.sol";

/**
 * @title Adapter for Maker Governance.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract MakerGovernanceAdapter is ProtocolAdapter {
    address internal constant GOVERNANCE = 0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5;

    /**
     * @return Amount of MKR tokens locked on the Governance module by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address, address account) public override returns (int256) {
        return int256(DSChief(GOVERNANCE).deposits(account));
    }
}
