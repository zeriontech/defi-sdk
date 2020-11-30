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


interface EarlyRewards {
    function rewards(address) external view returns (uint256);
}


/**
 * @title Adapter for idle.finance protocol (IDLE early rewards).
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract IdleRewardsAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant IDLE = 0x875773784Af8135eA0ef43b5a374AaD105c5D39e;
    address internal constant EARLY_REWARDS = 0xa1F71ED24ABA6c8Da8ca8C046bBc9804625d88Fc;

    /**
     * @return Amount of IDLE early rewards by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        uint256 reward = EarlyRewards(EARLY_REWARDS).rewards(account);
        return ERC20(IDLE).balanceOf(EARLY_REWARDS) >= reward ? reward : 0;
    }
}
