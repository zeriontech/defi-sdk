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

import { ERC20 } from "../../interfaces/ERC20.sol";
import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { CToken } from "../../interfaces/CToken.sol";
import { CompoundRegistry } from "./CompoundRegistry.sol";

/**
 * @title Debt adapter for Compound protocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CompoundDebtAdapter is ProtocolAdapter {
    address internal constant REGISTRY = 0xD0ff11EA62C867F6dF8E9cc37bb5339107FAb141;

    /**
     * @return Amount of debt of the given account for the protocol.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address token, address account) public override returns (int256) {
        CToken cToken = CToken(CompoundRegistry(REGISTRY).getCToken(token));

        return int256(-cToken.borrowBalanceCurrent(account));
    }
}
