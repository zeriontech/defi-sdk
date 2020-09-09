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

pragma solidity 0.7.1;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev TokenGeyser contract interface.
 * Only the functions required for AmpleforthStakingAdapter contract are added.
 * The TokenGeyser contract is available here
 * github.com/ampleforth/token-geyser/blob/master/contracts/TokenGeyser.sol.
 */
interface TokenGeyser {
    function totalStakedFor(address) external view returns (uint256);
}


/**
 * @title Asset adapter for Ampleforth Staking.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AmpleforthStakingAdapter is ProtocolAdapter {

    address internal immutable geyser_;

    constructor(address geyser) {
        require(geyser != address(0), "ASA: empty geyser");

        geyser_ = geyser;
    }

    /**
     * @return Amount of UNI-tokens locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(
        address,
        address account
    )
        public
        view
        override
        returns (uint256)
    {
        return TokenGeyser(geyser_).totalStakedFor(account);
    }
}