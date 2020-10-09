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

import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev UserInfo struct from MasterChef contract.
 * The MasterChef contract is available here
 * github.com/pickle-finance/contracts/blob/master/YieldFarming/MasterChef.sol.
 */
struct UserInfo {
    uint256 amount;
    uint256 rewardDebt;
}


/**
 * @dev PoolInfo struct from MasterChef contract.
 * The MasterChef contract is available here
 * github.com/pickle-finance/contracts/blob/master/YieldFarming/MasterChef.sol.
 */
struct PoolInfo {
    address lpToken;
    uint256 allocPoint;
    uint256 lastRewardBlock;
    uint256 accSushiPerShare;
}


/**
 * @dev MasterChef contract interface.
 * Only the functions required for PickleStakingV2Adapter contract are added.
 * The MasterChef contract is available here
 * github.com/pickle-finance/contracts/blob/master/YieldFarming/MasterChef.sol.
 */
interface MasterChef {
    function poolLength() external view returns (uint256);
    function poolInfo(uint256) external view returns (PoolInfo memory);
    function userInfo(uint256, address) external view returns (UserInfo memory);
    function pendingPickle(uint256, address) external view returns (uint256);
}


/**
 * @title Adapter for Pickle protocol (staking).
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract PickleStakingV2Adapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant PICKLE = 0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5;
    address internal constant MASTER_CHEF = 0xbD17B1ce622d73bD438b9E658acA5996dc394b0d;

    /**
     * @return Amount of staked tokens / claimable rewards for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        uint256 length = MasterChef(MASTER_CHEF).poolLength();

        if (token == PICKLE) {
            uint256 totalRewards = 0;

            for(uint256 i = 0; i < length; i++) {
                totalRewards += MasterChef(MASTER_CHEF).pendingPickle(i, account);
            }

            return totalRewards;
        } else {
            PoolInfo memory pool;
            for(uint256 i = 0; i < length; i++) {
                pool = MasterChef(MASTER_CHEF).poolInfo(i);

                if (pool.lpToken == token) {
                    return MasterChef(MASTER_CHEF).userInfo(i, account).amount;
                }
            }

            return 0;
        }
    }
}
