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
import { SavingsContract } from "../../interfaces/SavingsContract.sol";

/**
 * @title Asset adapter for mStable protocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract MstableAssetAdapter is ProtocolAdapter {
    address internal constant SAVINGS = 0xcf3F73290803Fc04425BEE135a4Caeb2BaB2C2A1;

    /**
     * @return Amount of mUSD owned and locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address, address account) public view override returns (int256) {
        uint256 credits = SavingsContract(SAVINGS).creditBalances(account);
        uint256 exchangeRate = SavingsContract(SAVINGS).exchangeRate();

        return int256((credits * exchangeRate) / 1e18);
    }
}
