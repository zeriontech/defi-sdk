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
import { ProtocolAdapter } from "../adapters/ProtocolAdapter.sol";


/**
 * @notice Mock protocol adapter for tests.
 * @dev Implementation of ProtocolAdapter Interface
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract RDaiAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "Redeemable Dai";


    /**
     * @return Amount of rDai held by the given account.
     * @param token Address of the rDai contrat.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        return ERC20(token).balanceOf(account);
    }
}