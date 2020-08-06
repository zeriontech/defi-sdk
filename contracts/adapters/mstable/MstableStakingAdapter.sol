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

import { ERC20 } from "../../ERC20.sol";
import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev StakingRewards contract interface.
 * Only the functions required for MstableStakingAdapter contract are added.
 * The StakingRewards contract is available here
 * github.com/mstable/mStable-contracts/blob/master/contracts/rewards/staking/StakingRewards.sol.
 */
interface StakingRewards {
    function earned(address) external view returns (uint256);
}


/**
 * @dev StakingRewardsWithPlatformToken contract interface.
 * Only the functions required for MstableStakingAdapter contract are added.
 * The StakingRewardsWithPlatformToken contract is available here
 * github.com/mstable/mStable-contracts/blob/master/contracts/rewards/staking/StakingRewardsWithPlatformToken.sol.
 */
interface StakingRewardsWithPlatformToken {
    function earned(address) external view returns (uint256, uint256);
}


/**
 * @title Adapter for mStable protocol staking.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract MstableStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant MTA = 0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2;
    address internal constant BAL = 0xba100000625a3754423978a60c9317c58a424e3D;
    address internal constant BALANCER_MUSD_MTA_20_80 = 0x003a70265a3662342010823bEA15Dc84C6f7eD54;
    address internal constant BALANCER_USDC_MUSD_50_50 = 0x72Cd8f4504941Bf8c5a21d1Fd83A96499FD71d2C;
    address internal constant BALANCER_MUSD_MTA_95_5 = 0xa5DA8Cc7167070B62FdCB332EF097A55A68d8824;
    address internal constant BALANCER_WETH_MUSD_50_50 = 0xe036CCE08cf4E23D33bC6B18e53Caf532AFa8513;
    address internal constant UNISWAP_MTA_WETH = 0x0d0d65E7A7dB277d3E0F5E1676325E75f3340455;

    address internal constant EARN_POOL = 0x881c72D1e6317f10a1cDCBe05040E7564E790C80;
    address internal constant EARN_POOL_2 = 0xf7575D4D4DB78F6Ba43C734616C51E9fD4bAA7fb;
    address internal constant EARN_POOL_3 = 0x25970282aAC735Cd4c76f30BfB0Bf2BC8DAD4e70;
    address internal constant EARN_POOL_4 = 0xf4a7d2d85F4BA11B5C73c35E27044c0c49F7f027;
    address internal constant EARN_POOL_5 = 0x9B4abA35b35EEE7481775cCB4055Ce4e176C9a6F;

    /**
     * @return Amount of YTokens held by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == MTA) {
            uint256 totalRewards = 0;
            uint256 reward;
            (reward, ) = StakingRewardsWithPlatformToken(EARN_POOL).earned(account);
            totalRewards += reward;
            (reward, ) = StakingRewardsWithPlatformToken(EARN_POOL_2).earned(account);
            totalRewards += reward;
            (reward, ) = StakingRewardsWithPlatformToken(EARN_POOL_3).earned(account);
            totalRewards += reward;
            (reward, ) = StakingRewardsWithPlatformToken(EARN_POOL_4).earned(account);
            totalRewards += reward;
            totalRewards += StakingRewards(EARN_POOL_5).earned(account);
            return totalRewards;
        } else if (token == BAL) {
            uint256 totalRewards = 0;
            uint256 reward;
            (, reward) = StakingRewardsWithPlatformToken(EARN_POOL).earned(account);
            totalRewards += reward;
            (, reward) = StakingRewardsWithPlatformToken(EARN_POOL_2).earned(account);
            totalRewards += reward;
            (, reward) = StakingRewardsWithPlatformToken(EARN_POOL_3).earned(account);
            totalRewards += reward;
            (, reward) = StakingRewardsWithPlatformToken(EARN_POOL_4).earned(account);
            totalRewards += reward;
            return totalRewards;
        } else if (token == BALANCER_USDC_MUSD_50_50) {
            return ERC20(EARN_POOL).balanceOf(account);
        } else if (token == BALANCER_WETH_MUSD_50_50) {
            return ERC20(EARN_POOL_2).balanceOf(account);
        } else if (token == BALANCER_MUSD_MTA_20_80) {
            return ERC20(EARN_POOL_3).balanceOf(account);
        } else if (token == BALANCER_MUSD_MTA_95_5) {
            return ERC20(EARN_POOL_4).balanceOf(account);
        } else if (token == UNISWAP_MTA_WETH) {
            return ERC20(EARN_POOL_5).balanceOf(account);
        } else {
            return 0;
        }
    }
}
