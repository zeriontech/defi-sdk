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

pragma solidity 0.8.10;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { ZeroReceiver, FailedEtherTransfer } from "./Errors.sol";

library Base {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Transfers tokens or Ether
     * @param token Adress of the token or `ETH` in case of Ether transfer
     * @param account Adress of the account that will receive funds
     * @param amount Amount to be transferred
     * @dev This function is compatible only with IERC20 tokens and Ether, not ERC721/1155 tokens
     * @dev Reverts on `address(0)` account, does nothing for `address(0)` token and `0` amount
     */
    function transfer(
        address token,
        address account,
        uint256 amount
    ) internal {
        if (amount == uint256(0) || token == address(0)) return;

        if (account == address(0)) revert ZeroReceiver();

        if (token == ETH) {
            Base.transferEther(account, amount);
        } else {
            SafeERC20.safeTransfer(IERC20(token), account, amount);
        }
    }

    /**
     * @dev Safely transfers Ether
     * @param to Address to transfer Ether to
     * @param amount Ether amount to be transferred
     */
    function transferEther(address to, uint256 amount) internal {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = to.call{ value: amount, gas: 5000 }(new bytes(0));

        if (!success) revert FailedEtherTransfer(to);
    }

    /**
     * @dev Safely approves type(uint256).max tokens
     * @param token Adress of the token
     * @param spender Address to approve tokens to
     * @param amount Tokens amount to be approved
     * @dev Do nothing for `address(0)` or ETH token
     */
    function safeApproveMax(
        address token,
        address spender,
        uint256 amount
    ) internal {
        if (token == address(0) || token == ETH) return;

        uint256 allowance = IERC20(token).allowance(address(this), spender);
        if (allowance < amount) {
            if (allowance > 0) {
                SafeERC20.safeApprove(IERC20(token), spender, 0);
            }
            SafeERC20.safeApprove(IERC20(token), spender, type(uint256).max);
        }
    }

    /**
     * @notice Calculates the token balance for the given account
     * @param token Adress of the token
     * @param account Adress of the account
     * @dev Returns 0 for `address(0)` token
     */
    function getBalance(address token, address account) internal view returns (uint256) {
        if (token == address(0)) return 0;

        if (token == ETH) return account.balance;

        return IERC20(token).balanceOf(account);
    }

    /**
     * @notice Calculates the token balance for `this` contract address
     * @param token Adress of the token
     * @dev Returns 0 for `address(0)` token
     */
    function getBalance(address token) internal view returns (uint256) {
        return getBalance(token, address(this));
    }
}
