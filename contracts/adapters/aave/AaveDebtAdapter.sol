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
import { LendingPoolAddressesProvider } from "../../interfaces/LendingPoolAddressesProvider.sol";
import { LendingPool } from "../../interfaces/LendingPool.sol";

/**
 * @title Debt adapter for Aave protocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AaveDebtAdapter is ProtocolAdapter {
    address internal immutable provider_;

    constructor(address provider) {
        require(provider != address(0), "ADA: empty provider");

        provider_ = provider;
    }

    /**
     * @return Amount of debt of the given account for the protocol.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address token, address account) public override returns (int256) {
        address pool = LendingPoolAddressesProvider(provider_).getLendingPool();

        (, uint256 debtAmount) = LendingPool(pool).getUserReserveData(token, account);

        return int256(-debtAmount);
    }
}
