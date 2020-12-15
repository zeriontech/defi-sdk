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
import { StakingRewards } from "../../interfaces/StakingRewards.sol";

/**
 * @title Asset adapter for Synthetix protocol.
 * @dev Implementation of ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract SynthetixStakingAdapter is ProtocolAdapter {
    address internal immutable stakingContract_;
    address internal immutable stakingToken_;
    address internal immutable rewardsToken_;

    constructor(
        address stakingContract,
        address stakingToken,
        address rewardsToken
    ) {
        require(stakingContract != address(0), "SSA: empty stakingContract");
        require(stakingToken != address(0), "SSA: empty stakingToken");
        require(rewardsToken != address(0), "SSA: empty rewardsToken");

        stakingContract_ = stakingContract;
        stakingToken_ = stakingToken;
        rewardsToken_ = rewardsToken;
    }

    /**
     * @return Amount of SNX locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter abstract contract function.
     */
    function getBalance(address token, address account) public view override returns (int256) {
        if (token == stakingToken_) {
            return int256(ERC20(stakingContract_).balanceOf(account));
        } else if (token == rewardsToken_) {
            return int256(StakingRewards(stakingContract_).earned(account));
        } else {
            return int256(0);
        }
    }
}
