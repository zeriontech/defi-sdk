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
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { FailedEtherTransfer, ZeroAccount, ZeroOutputToken } from "./Errors.sol";

/**
 * @title Library unifying transfer, approval, and getting balance for ERC20 tokens and Ether
 */
library Base {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Transfers tokens or Ether
     * @param token Adress of the token or `ETH` in case of Ether transfer
     * @param account Adress of the account that will receive funds
     * @param amount Amount to be transferred
     * @dev This function is compatible only with ERC20 tokens and Ether, not ERC721/ERC1155 tokens
     * @dev Reverts on `address(0)` account, does nothing for `0` amount
     * @dev Should not be used with `address(0)` token address
     */
    function transfer(
        address token,
        address account,
        uint256 amount
    ) internal {
        if (amount == uint256(0)) return;
        if (account == address(0)) revert ZeroAccount();

        if (token == ETH) {
            Address.sendValue(payable(account), amount);
        } else {
            SafeERC20.safeTransfer(IERC20(token), account, amount);
        }
    }

    /**
     * @notice Safely approves type(uint256).max tokens
     * @param token Adress of the token
     * @param spender Address to approve tokens to
     * @param amount Tokens amount to be approved
     * @dev Should not be used with `address(0)` or ETH token address
     */
    function safeApproveMax(
        address token,
        address spender,
        uint256 amount
    ) internal {
        uint256 allowance = IERC20(token).allowance(address(this), spender);
        if (allowance < amount) {
            if (allowance > 0) {
                IERC20(token).approve(spender, 0);
            }
            IERC20(token).approve(spender, type(uint256).max);
        }
    }

    /**
     * @notice Calculates the token balance for the given account
     * @param token Adress of the token
     * @param account Adress of the account
     * @dev Should not be used with `address(0)` token address
     */
    function getBalance(address token, address account) internal view returns (uint256) {
        if (token == ETH) return account.balance;

        return IERC20(token).balanceOf(account);
    }
}
