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
 * Only the functions required for YearnStakingV1Adapter contract are added.
 * The StakingRewards contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol.
 */
interface StakingRewards {
    function earned(address) external view returns (uint256);
}


/**
 * @title Adapter for Yearn.finance YFI Staking protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract YearnStakingV1Adapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant YFI = 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e;
    address internal constant CURVE_Y = 0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8;
    address internal constant BALANCER_DAI_YFI_98_2 = 0x60626db611a9957C1ae4Ac5b7eDE69e24A3B76c5;
    address internal constant BALANCER_YFI_CURVE_Y_2_98 = 0x95C4B6C7CfF608c0CA048df8b81a484aA377172B;

    address internal constant CURVE = 0x0001FB050Fe7312791bF6475b96569D83F695C9f;
    address internal constant BALANCER = 0x033E52f513F9B98e129381c6708F9faA2DEE5db5;
    address internal constant GOVERNANCE = 0x3A22dF48d84957F907e67F4313E3D43179040d6E;
    address internal constant FEE_REWARDS = 0xb01419E74D8a2abb1bbAD82925b19c36C191A701;

    /**
     * @return Amount of YFI rewards earned after staking in a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
      if (token == YFI) {
          uint256 totalRewards = 0;
          totalRewards += StakingRewards(CURVE).earned(account);
          totalRewards += StakingRewards(BALANCER).earned(account);
          totalRewards += StakingRewards(GOVERNANCE).earned(account);
          totalRewards += ERC20(FEE_REWARDS).balanceOf(account);
          return totalRewards;
      } else if (token == CURVE_Y) {
          uint256 totalRewards = 0;
          totalRewards += ERC20(CURVE).balanceOf(account);
          totalRewards += StakingRewards(FEE_REWARDS).earned(account);
          return totalRewards;
      } else if (token == BALANCER_DAI_YFI_98_2) {
          return ERC20(BALANCER).balanceOf(account);
      } else if (token == BALANCER_YFI_CURVE_Y_2_98) {
          return ERC20(GOVERNANCE).balanceOf(account);
      } else {
          return 0;
      }
    }
  }
