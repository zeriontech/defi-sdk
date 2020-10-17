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
import { TokenGeyser } from "../../interfaces/TokenGeyser.sol";

/**
 * @title Asset adapter for Ampleforth Staking.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AmpleforthStakingAdapter is ProtocolAdapter {
    address[] internal geysers_;
    address internal immutable stakingToken_;

    constructor(address[] memory geysers, address stakingToken) {
        require(geysers.length != 0, "ASA: empty geysers");
        require(stakingToken != address(0), "ASA: empty stakingToken");

        geysers_ = geysers;
        stakingToken_ = stakingToken;
    }

    function setGeysers(address[] calldata geysers) external {
        require(geysers.length != 0, "ASA: empty geysers");

        geysers_ = geysers;
    }

    function getGeysers() external view returns (address[] memory) {
        return geysers_;
    }

    /**
     * @return Amount of UNI-tokens locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address token, address account) public override returns (int256) {
        if (token == stakingToken_) {
            int256 totalBalance = 0;
            uint256 length = geysers_.length;

            for (uint256 i = 0; i < length; i++) {
                totalBalance += int256(TokenGeyser(geysers_[i]).totalStakedFor(account));
            }

            return totalBalance;
        } else {
            return int256(0);
        }
    }
}
