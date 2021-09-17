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

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import {ERC20} from "../../ERC20.sol";
import {ProtocolAdapter} from "../ProtocolAdapter.sol";


interface ITimeWarpPool {
    function userStacked(address) external view returns (uint256);
}

/**
 * @title Adapter for Time protocol (staking).
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TimeEthLpStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant TIME_ETH_LP = 0x1d474d4B4A62b0Ad0C819841eB2C74d1c5050524;
    address internal constant STACKING_POOL_TIME_ETH_LP = 0x55c825983783c984890bA89F7d7C9575814D83F2;

    /**
     * @return Amount of staked TIME tokens for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token != TIME_ETH_LP) return 0;
        return ITimeWarpPool(STACKING_POOL_TIME_ETH_LP).userStacked(account);
    }
}
