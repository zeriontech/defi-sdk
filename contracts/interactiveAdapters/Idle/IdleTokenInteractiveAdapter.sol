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
import { IdleInteractiveAdapter } from "./IdleInteractiveAdapter.sol";



interface IdleTokenV3 {
    function mintIdleToken(uint256 _amount, bool _skipWholeRebalance) external returns (uint256 mintedTokens);
    function redeemIdleToken(uint256 _amount, bool _skipRebalance, uint256[] calldata _clientProtocolAmounts) external returns (uint256 redeemedTokens);

}
/**
 * @title Interactive adapter for Idle.finance.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract IdleTokenInteractiveAdapter is InteractiveAdapter, IdleAdapter, IdleInteractiveAdapter {
  using SafeERC20 for ERC20;




  /**
   * @notice Wraps deposited token in IdleToken
   * @dev Implementation of InteractiveAdapter function.
   */

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
      address destination = getDeposit(tokens[0]); //unused currently

      require(tokens.length == 1, "IIA: should be 1 tokens![1]");
      require(tokens.length == amounts.length, "IIA: inconsistent arrays![1]");


      uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

      tokensToBeWithdrawn = new address[](1);
      tokensToBeWithdrawn[0] = IdleTokenV3(destination).token();

      ERC20(tokens[0]).safeApprove(destination, amount, "IIA!");

      try IdleTokenV3(getDeposit(tokens[0])).mintIdleToken(amount, true) {
      }  catch Error(string memory reason) {
          revert(reason);
      } catch {
          revert("IIA: deposit fail!");
      }
  }

  /**
   * @notice Unwraps deposited token from Wrapped IdleToken.
   * @dev Implementation of InteractiveAdapter function.
   */

    function withdraw(
        address[] memory,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {

    require(tokens.length == 1, "IIA should be 1 token![2]");
    require(tokens.length == amounts.length, "IIA: inconsistent arrays![2]");



    uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

    tokensToBeWithdrawn = new address[](1);

    try IdleTokenV3(getDeposit(tokens[0])).redeemIdleToken(tokens[0], amount, []) {
    } catch Error(string memory reason) {
        revert(reason);
    } catch {
        revert("IIA: idleToken fail!");
    }
}

}
