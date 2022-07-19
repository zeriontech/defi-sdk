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
 * @dev Proxy contract interface for calculating liquidity mining rewards.
 * Only the functions required for PendleStakingZerionProxy contract are added.
 */
interface PendleStakingZerionProxy {
    function earned(address user) external view returns (uint256);
}

/**
 * @title Adapter for Pendle Finance protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Anton Buenavista <anton@pendle.finance>
 */
contract PendleStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant PENDLE = 0x808507121B80c02388fAd14726482e061B8da827;
    address internal constant STAKING_WRAPPER = 0x3cFfEd42e0BD6d45894283d90cF3F75e7CA55855;

    /**
     * @return Amount of PENDLE rewards after staking for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == PENDLE) {
            return PendleStakingZerionProxy(STAKING_WRAPPER).earned(account);
        }
    }
}
