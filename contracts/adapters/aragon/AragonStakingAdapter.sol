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
 * Only the functions required for AragonStakingAdapter contract are added.
 * The StakingRewards contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol.
 */
interface StakingRewards {
    function earned(address) external view returns (uint256);
}


/**
 * @title Adapter for Aragon protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AragonStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant ANT = 0x960b236A07cf122663c4303350609A66A7B288C0;
    address internal constant UNI_ANT_WETH = 0xfa19de406e8F5b9100E4dD5CaD8a503a6d686Efe;
    address internal constant LIQUIDITY = 0xEA4D68CF86BcE59Bf2bFA039B97794ce2c43dEBC;

    /**
     * @return Amount of staked tokens / rewards by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == UNI_ANT_WETH) {
            return ERC20(LIQUIDITY).balanceOf(account);
        } else if (token == ANT) {
            return StakingRewards(LIQUIDITY).earned(account);
        } else {
            return 0;
        }
    }
}
