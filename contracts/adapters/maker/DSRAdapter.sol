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
import { MKRAdapter } from "./MakerAdapter.sol";
import { Pot } from "../../interfaces/Pot.sol";

/**
 * @title Adapter for DSR protocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract DSRAdapter is ProtocolAdapter, MKRAdapter {
    /**
     * @return Amount of DAI locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     * This function repeats the calculations made in drip() function of Pot contract.
     */
    function getBalance(address, address account) public override returns (int256) {
        Pot pot = Pot(POT);
        // solhint-disable-next-line not-rely-on-time
        uint256 chi = mkrRmul(mkrRpow(pot.dsr(), block.timestamp - pot.rho(), ONE), pot.chi());

        return int256(mkrRmul(chi, pot.pie(account)));
    }
}
