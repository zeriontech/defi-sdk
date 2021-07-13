// Copyright (C) 2021 Zerion Inc. <https://zerion.io>
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


interface SingleAssetStaking {
    function totalCurrentHoldings(address) external view returns (uint256);
}


/**
 * @title Asset adapter for OGN staking.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract OgnStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";


    address internal constant OGN = 0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26;
    address internal constant OGN_STAKING = 0x501804B374EF06fa9C427476147ac09F1551B9A0;

    /**
     * @return Amount of OGN staked by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == OGN) {
            return SingleAssetStaking(OGN_STAKING).totalCurrentHoldings(account);
        }

        return 0;
    }
}
