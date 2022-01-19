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

pragma solidity 0.8.11;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { FailedEtherTransfer, ZeroReceiver } from "./Errors.sol";

/**
 * @title Library unifying transfer, approval, and getting balance for ERC20 tokens and Ether
 */
library Base {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Transfers tokens or Ether
     * @param token Address of the token or `ETH` in case of Ether transfer
     * @param receiver Address of the account that will receive funds
     * @param amount Amount to be transferred
     * @dev This function is compatible only with ERC20 tokens and Ether, not ERC721/ERC1155 tokens
     * @dev Reverts on zero `receiver`, does nothing for zero amount
     * @dev Should not be used with zero token address
     */
    function transfer(
        address token,
        address receiver,
        uint256 amount
    ) internal {
        if (amount == uint256(0)) return;
        if (receiver == address(0)) revert ZeroReceiver();

        if (token == ETH) {
            Address.sendValue(payable(receiver), amount);
        } else {
            SafeERC20.safeTransfer(IERC20(token), receiver, amount);
        }
    }

    /**
     * @notice Safely approves type(uint256).max tokens
     * @param token Address of the token
     * @param spender Address to approve tokens to
     * @param amount Tokens amount to be approved
     * @dev Should not be used with zero or `ETH` token address
     */
    function safeApproveMax(
        address token,
        address spender,
        uint256 amount
    ) internal {
        uint256 allowance = IERC20(token).allowance(address(this), spender);
        if (allowance < amount) {
            if (allowance > uint256(0)) {
                IERC20(token).approve(spender, uint256(0));
            }
            IERC20(token).approve(spender, type(uint256).max);
        }
    }

    /**
     * @notice Calculates the token balance for the given account
     * @param token Address of the token
     * @param account Address of the account
     * @dev Should not be used with zero token address
     */
    function getBalance(address token, address account) internal view returns (uint256) {
        if (token == ETH) return account.balance;

        return IERC20(token).balanceOf(account);
    }

    /**
     * @notice Calculates the token balance for `this` contract address
     * @param token Address of the token
     * @dev Returns `0` for zero token address in order to handle empty token case
     */
    function getBalance(address token) internal view returns (uint256) {
        if (token == address(0)) return uint256(0);

        return Base.getBalance(token, address(this));
    }
}
