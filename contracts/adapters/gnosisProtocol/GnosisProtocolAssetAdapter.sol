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

/**
 * @dev EpochTokenLocker contract interface.
 * Only the functions required for GnosisProtocolAdapter contract are added.
 * The EpochTokenLocker contract is available here
 * github.com/gnosis/dex-contracts/blob/master/contracts/EpochTokenLocker.sol.
 */
interface EpochTokenLocker {
    function getBalance(address, address) external view returns (uint256);
}

/**
 * @title Asset adapter for GnosisProtocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Marek Galvanek <marek.galvanek@gmail.com>
 */
contract GnosisProtocolAssetAdapter is ProtocolAdapter {
    address internal constant BALANCE = 0x6F400810b62df8E13fded51bE75fF5393eaa841F;

    /**
     * @return Amount of token locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address token, address account) public override returns (int256) {
        return int256(EpochTokenLocker(BALANCE).getBalance(account, token));
    }
}
