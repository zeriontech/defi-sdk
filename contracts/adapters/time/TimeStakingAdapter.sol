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

    function userLastReward(address) external view returns (uint32);

    function getReward(address, uint32) external view returns (uint256, uint32);
}

/**
 * @title Adapter for Time protocol (staking).
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TimeStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant TIME = 0x6531f133e6DeeBe7F2dcE5A0441aA7ef330B4e53;
    address internal constant STACKING_POOL_TIME = 0xa106dd3Bc6C42B3f28616FfAB615c7d494Eb629D;

    /**
     * @return Amount of staked TIME tokens for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token != TIME) return 0;
        uint256 totalBalance = 0;
        totalBalance += ITimeWarpPool(STACKING_POOL_TIME).userStacked(account);
        uint32 lastReward = ITimeWarpPool(STACKING_POOL_TIME).userLastReward(account);
        (uint256 amount,) = ITimeWarpPool(STACKING_POOL_TIME).getReward(account, lastReward);
        totalBalance += amount;
        return totalBalance;
    }
}
