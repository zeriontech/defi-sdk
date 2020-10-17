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
import { Vat } from "../../interfaces/Vat.sol";
import { Jug } from "../../interfaces/Jug.sol";
import { DssCdpManager } from "../../interfaces/DssCdpManager.sol";

/**
 * @title Asset adapter for MCD protocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract MCDAssetAdapter is ProtocolAdapter, MKRAdapter {
    /**
     * @return Amount of collateral locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address token, address account) public override returns (int256) {
        DssCdpManager manager = DssCdpManager(MANAGER);
        Vat vat = Vat(VAT);
        uint256 id = manager.first(account);
        address urn;
        bytes32 ilk;
        int256 value;
        int256 totalValue = 0;
        uint256 ink;

        while (id > 0) {
            urn = manager.urns(id);
            ilk = manager.ilks(id);
            (, id) = manager.list(id);
            (ink, ) = vat.urns(ilk, urn);

            if ((token == WETH && ilk == "ETH-A") || (token == BAT && ilk == "BAT-A")) {
                value = int256(ink);
            } else {
                value = int256(0);
            }

            totalValue = totalValue + value;
        }

        return totalValue;
    }
}
