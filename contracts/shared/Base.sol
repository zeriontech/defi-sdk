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

pragma solidity 0.8.1;

import { ERC20 } from "../interfaces/ERC20.sol";
import { Helpers } from "../shared/Helpers.sol";
import { SafeERC20 } from "../shared/SafeERC20.sol";

library Base {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Calculates the token balance for the given account.
     * @param token Adress of the token.
     * @param account Adress of the account.
     */
    function getBalance(address token, address account) internal view returns (uint256) {
        if (token == address(0)) {
            return 0;
        }

        if (token == ETH) {
            return account.balance;
        }

        return ERC20(token).balanceOf(account);
    }

    /**
     * @notice Transfers tokens or Ether.
     * @param token Adress of the token or `ETH` in case of Ether transfer.
     * @param account Adress of the account that will receive funds.
     * @param amount Amount to be transferred.
     * @dev This function is compatible only with ERC20 tokens and Ether, not ERC721 tokens.
     */
    function transfer(
        address token,
        address account,
        uint256 amount
    ) internal {
        if (token == ETH) {
            Base.transferEther(account, amount, "B: bad account");
        } else {
            SafeERC20.safeTransfer(token, account, amount, "B");
        }
    }

    /**
     * @dev Safe Ether transfer.
     * @param to Address to transfer Ether to.
     * @param amount Ether amount to be transferred.
     * @param error Error string to be used in require().
     */
    function transferEther(
        address to,
        uint256 amount,
        string memory error
    ) internal {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = to.call{ value: amount }(new bytes(0));
        require(success, error);
    }

    /**
     * @dev Executes static call.
     * @param callee Address to be called.
     * @param selector Function selector.
     * @param callData Function calldata.
     * @param location Location of the call (for debug).
     */
    function staticCall(
        address callee,
        bytes4 selector,
        bytes memory callData,
        string memory location
    ) internal view returns (bytes memory returnData) {
        require(callee != address(0), "B: zero callee");

        bool success;
        // solhint-disable-next-line avoid-low-level-calls
        (success, returnData) = callee.staticcall(abi.encodePacked(selector, callData));

        if (!success) {
            revert(Helpers.parseRevertReason(returnData, location));
        }

        return returnData;
    }

    /**
     * @dev Executes external call.
     * @param callee Address to be called.
     * @param selector Function selector.
     * @param callData Function calldata.
     * @param etherValue Amount of Ether to be sent with call.
     * @param location Location of the call (for debug).
     */
    function externalCall(
        address callee,
        bytes4 selector,
        bytes memory callData,
        uint256 etherValue,
        string memory location
    ) internal returns (bytes memory returnData) {
        require(callee != address(0), "B: zero callee");

        bool success;
        // solhint-disable-next-line avoid-low-level-calls
        (success, returnData) = callee.call{ value: etherValue }(
            abi.encodePacked(selector, callData)
        );

        if (!success) {
            revert(Helpers.parseRevertReason(returnData, location));
        }

        return returnData;
    }

    /**
     * @dev Executes delegated call.
     * @param callee Address to be called.
     * @param selector Function selector.
     * @param callData Function calldata.
     */
    function delegateCall(
        address callee,
        bytes4 selector,
        bytes memory callData
    ) internal returns (bytes memory returnData) {
        require(callee != address(0), "B: zero callee");

        bool success;
        // solhint-disable-next-line avoid-low-level-calls
        (success, returnData) = callee.delegatecall(abi.encodePacked(selector, callData));

        if (!success) {
            revert(Helpers.parseRevertReason(returnData, ""));
        }

        return returnData;
    }
}
