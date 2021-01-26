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
 * @dev BondingManager contract interface.
 * Only the functions required for LivepeerStakingAdapter contract are added.
 * The BondingManager contract is available here
 * github.com/livepeer/protocol/blob/streamflow/contracts/bonding/BondingManager.sol.
 */
interface BondingManager {
    function pendingStake(address, uint256) external view returns (uint256);
}


/**
 * @dev RoundsManager contract interface.
 * Only the functions required for LivepeerStakingAdapter contract are added.
 * The RoundsManager contract is available here
 * github.com/livepeer/protocol/blob/streamflow/contracts/rounds/RoundsManager.sol.
 */
interface RoundsManager {
    function currentRound() external view returns (uint256);
}


/**
 * @title Adapter for Livepeer protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Adam Soffer <adam@livepeer.org>
 */
contract LivepeerStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant LPT = 0x58b6A8A3302369DAEc383334672404Ee733aB239;
    address internal constant BONDING_MANAGER = 0x511Bc4556D823Ae99630aE8de28b9B80Df90eA2e;
    address internal constant ROUNDS_MANAGER = 0x3984fc4ceEeF1739135476f625D36d6c35c40dc3;

    /**
     * @return Amount of LPT staked by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == LPT) {
            uint256 currentRound = RoundsManager(ROUNDS_MANAGER).currentRound();
            return BondingManager(BONDING_MANAGER).pendingStake(account, currentRound);
        } else {
            return 0;
        }

    }
}
