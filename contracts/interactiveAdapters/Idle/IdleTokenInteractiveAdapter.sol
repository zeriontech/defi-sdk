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
//
// SPDX-License-Identifier: LGPL-3.0-only

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { Action, AmountType } from "../../shared/Structs.sol";
import { IdleAdapter } from "../../adapters/idle/IdleAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { IdleIinteractiveAdapter } from "./IdleInteractiveAdapter.sol";



interface IdleTokenV3 {
    function mintIdleToken(uint256, uint256) external returns (uint256);
    function redeemIdleToken(uint256, bool, uint256) external returns (uint256);

}

contract IdleTokenInteractiveAdapter is InteractiveAdapter, IdleAdapter, IdleInteractiveAdapter {
  using SafeERC20 for ERC20;




  function deposit(
      address[] memory tokens,
      uint256[] memory amounts,
      AmountType[] memory amountTypes,
      bytes memory data
  )
      public
      payable
      override
      returns (address[] memory tokensToBeWithdrawn)
  {
}
