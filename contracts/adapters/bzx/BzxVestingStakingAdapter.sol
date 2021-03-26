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

/**
 * @dev StakingRewards contract interface.
 * Only the functions required for AragonStakingAdapter contract are added.
 * The StakingRewards contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol.
 */
interface StakingRewards {
    function earned(address)
        external
        view
        returns (
            uint256 bzrxRewardsEarned,
            uint256 stableCoinRewardsEarned,
            uint256 bzrxRewardsVesting,
            uint256 stableCoinRewardsVesting
        );
}

/**
 * @title Vesting only Adapter for BZX protocol (staking). This adapter will return only vesting balances
 * @dev Implementation of ProtocolAdapter interface.
 * @author Roman Iftodi <romeo8881@gmail.com>
 */
contract BzxVestingStakingAdapter is ProtocolAdapter {
    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant BZRX = 0x56d811088235F11C8920698a204A5010a788f4b3;
    address internal constant CURVE3CRV =
        0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490;

    address internal constant STAKING_CONTRACT =
        0xe95Ebce2B02Ee07dEF5Ed6B53289801F7Fc137A4;

    /**
     * @return Amount of staked LP tokens for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account)
        external
        view
        override
        returns (uint256)
    {
        (, uint256 curve3crvVesting, uint256 bzrxEarningsVesting, ) =
            StakingRewards(STAKING_CONTRACT).earned(account);
        if (token == BZRX) {
            return bzrxEarningsVesting;
        } else if (token == CURVE3CRV) {
            return curve3crvVesting;
        } else {
            return 0;
        }
    }
}
