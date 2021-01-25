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
    function pendingStake(address, uint256) public view returns (uint256);
}

/**
 * @dev RoundsManager contract interface.
 * Only the functions required for LivepeerStakingAdapter contract are added.
 * The RoundsManager contract is available here
 * github.com/livepeer/protocol/blob/streamflow/contracts/rounds/RoundsManager.sol.
 */
interface RoundsManager {
    function currentRound() public view returns (uint256);
}


/**
 * @title Adapter for Livepeer protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract LivepeerStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant LPT = 0x58b6a8a3302369daec383334672404ee733ab239;
    address internal constant BONDING_MANAGER = 0x511bc4556d823ae99630ae8de28b9b80df90ea2e;
    address internal constant ROUNDS_MANAGER = 0x3984fc4ceeef1739135476f625d36d6c35c40dc3;

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
