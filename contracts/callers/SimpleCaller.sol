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

import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { ICaller } from "../interfaces/ICaller.sol";
import { Base } from "../shared/Base.sol";
import { ActionType } from "../shared/Enums.sol";
import { HighInputBalanceChange, ZeroTarget } from "../shared/Errors.sol";
import { AbsoluteTokenAmount } from "../shared/Structs.sol";
import { TokensHandler } from "../shared/TokensHandler.sol";

/**
 * @title Simple caller that passes through any call and forwards return tokens
 */
contract SimpleCaller is ICaller, TokensHandler {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Main external function: decodes `callerCallData` bytes,
     *     executes external call, and returns tokens back to `msg.sender` (i.e. Router contract)
     * @param input AbsoluteTokenAmount struct with input token and absolute amount
     * @param callerCallData ABI-encoded parameters:
     *     - inputToken Address of the token that should be taken by the external call target
     *     - inputAmount Amount of input token that should be taken by the external call target
     *     - allowanceTarget Address to approve `inputToken` to
     *     - callTarget Address to forward the external call to
     *     - callData Call data to be used in the external call
     *     - outputToken Address of the token that should be returned
     * @dev `target` cannot be zero
     * @dev In case of non-zero input token, refund is returned back to `msg.sender`
     * @dev In case of zero `outputToken`, nothing is returned back to `msg.sender`
     */
    function callBytes(AbsoluteTokenAmount calldata input, bytes calldata callerCallData)
        external
        override
    {
        (
            address allowanceTarget,
            address payable callTarget,
            bytes memory callData,
            address outputToken
        ) = abi.decode(callerCallData, (address, address, bytes, address));
        if (callTarget == address(0)) revert ZeroTarget();

        // No need to save initial balance, so the following code is placed in a separate block
        uint256 inputBalanceChange;
        {
            // Calculate the initial balances for input and output tokens
            uint256 initialInputBalance = Base.getBalance(input.token);

            approveAndCall(input, allowanceTarget, callTarget, callData);

            // Calculate the balance changes for input and output tokens
            inputBalanceChange = initialInputBalance - Base.getBalance(input.token);
        }

        // In case of non-zero input token, return the remaining amount back to `msg.sender`
        if (input.token != address(0)) {
            // Check input requirements, prevent the underflow
            if (inputBalanceChange > input.absoluteAmount)
                revert HighInputBalanceChange(inputBalanceChange, input.absoluteAmount);

            // Transfer the remaining amount back to `msg.sender`
            Base.transfer(input.token, msg.sender, input.absoluteAmount - inputBalanceChange);
        }

        // In case of non-zero output token, transfer the total balance to `msg.sender`
        if (outputToken != address(0))
            Base.transfer(outputToken, msg.sender, Base.getBalance(outputToken, address(this)));
    }

    /**
     * @dev Approves input tokens (if necessary) and calls the target with the provided call data
     * @dev Approval and allowance check for `address(0)` token address are skipped
     * @param input AbsoluteTokenAmount struct with input token and absolute amount
     * @param allowanceTarget Address to approve `inputToken` to
     * @param callTarget Address to forward the external call to
     * @param callData Call data for the call to the target
     */
    function approveAndCall(
        AbsoluteTokenAmount calldata input,
        address allowanceTarget,
        address callTarget,
        bytes memory callData
    ) internal {
        if (input.token == ETH) {
            Address.functionCallWithValue(
                callTarget,
                callData,
                input.absoluteAmount,
                "SC: payable call failed w/ no reason"
            );
            return;
        }

        if (input.token != address(0) && allowanceTarget != address(0))
            Base.safeApproveMax(input.token, allowanceTarget, input.absoluteAmount);

        Address.functionCall(callTarget, callData, "SC: call failed w/ no reason");
    }
}
