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
 * @dev Yearn YFI Rewards Token Interface.
 * Only the functions required for YFIAdapter contract are added.
 * The YearnRewards contract is available here
 * 0xcc9EFea3ac5Df6AD6A656235Ef955fBfEF65B862
 */

/*
interface YearnRewards {
    function claimable(address) external view returns (uint);
}
*/

/**
 * @dev YearnRewards contract interface.
 * Only the functions required for YFIAdapter contract are added.
 * The YearnRewards Curve Pool contract is available here
 * 0xcc9EFea3ac5Df6AD6A656235Ef955fBfEF65B862
 * The YearnRewards Balancer Pool contract is available here
 * 0x033E52f513F9B98e129381c6708F9faA2DEE5db5
 */

interface YearnRewards {
    function earned(address) external view returns (uint256);
}

/**
 * @dev YearnGovernance contract interface.
 * Only the functions required for YFIAdapter contract are added.
 * The YearnRewards Governance contract is available here
 * 0x3A22dF48d84957F907e67F4313E3D43179040d6E
 */

interface YearnGovernance {
    function earned(address) external view returns (uint256);
}



/**
 * @title Adapter for Yearn.finance YFI Staking protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */

contract YFIAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "YFIToken";

    address internal constant YEARNREWARDS_STAKING_CURVEPOOL = 0x0001FB050Fe7312791bF6475b96569D83F695C9f;
    address internal constant YEARNREWARDS_STAKING_BALANCERPOOL = 0x033E52f513F9B98e129381c6708F9faA2DEE5db5;
    address internal constant YEARNREWARDS_STAKING_GOVERNANCEPOOL = 0x3A22dF48d84957F907e67F4313E3D43179040d6E;
    //address internal constant YEARNREWARDS_CONTRACT = 0xcc9EFea3ac5Df6AD6A656235Ef955fBfEF65B862;
    address internal constant YFI = 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e;

    /**
     * @return Amount of YFI rewards earned after staking in a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */


    function getBalance(address token, address account) external view override returns (uint256) {
      /*  if (token == YFI) {
          return YearnRewards(YEARNREWARDS_CONTRACT).claimable(account);
      }  else */if (token == YEARNREWARDS_STAKING_CURVEPOOL) {
          return YearnRewards(YEARNREWARDS_STAKING_CURVEPOOL).earned(account);
      } else if (token == YEARNREWARDS_STAKING_BALANCERPOOL) {
          return YearnRewards(YEARNREWARDS_STAKING_BALANCERPOOL).earned(account);
      }  else if (token == YEARNREWARDS_STAKING_GOVERNANCEPOOL) {
          return YearnGovernance(YEARNREWARDS_STAKING_GOVERNANCEPOOL).earned(account);
      }  else   {
        return 0;
      }
    }
  }
