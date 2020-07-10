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
 * @dev Shares contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Shares contract is available here
 * github.com/melonproject/protocol/blob/develop/contracts/fund/shares/Shares.sol.
 */

interface Shares {
    function calcGav() public returns (uint256);
}

/**
 * @title adapter for Melon protocol.
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract MelonAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "MelonToken";

    address internal constant MLN = 0xBEB9eF514a379B997e0798FDcC901Ee474B6D9A1;

    /**
     * @return Amount of MLNF held by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
      return ERC20(token).balanceOf(account);
    }
}
