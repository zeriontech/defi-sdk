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

import { BaseRouter } from "./BaseRouter.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";
import { Base } from "../shared/Base.sol";
import { Helpers } from "../shared/Helpers.sol";
import { Ownable } from "../shared/Ownable.sol";
import { SafeERC20 } from "../shared/SafeERC20.sol";
import { AbsoluteTokenAmount, Input, SwapType, SwapDescription } from "../shared/Structs.sol";

import { ChiToken } from "../interfaces/ChiToken.sol";
import { Caller } from "../interfaces/Caller.sol";
import { ERC20 } from "../interfaces/ERC20.sol";

contract Router is Ownable, BaseRouter, SignatureVerifier("Zerion Router V2") {
    address internal constant CHI = 0x0000000000004946c0e9F43F4Dee607b0eF1fA1c;

    /**
     * @dev The amount used as second parameter of freeFromUpTo() function
     * is the solution of the following equation:
     *     21000 + calldataCost + executionCost + constBurnCost + n * perTokenBurnCost =
     *         2 * (24000 * n + otherRefunds)
     * Here,
     *     calldataCost = 7 * msg.data.length
     *     executionCost = 21000 + gasStart - gasleft()
     *     constBurnCost = 25171
     *     perTokenBurnCost = 6148
     *     otherRefunds = 0
     */
    modifier useCHI {
        uint256 gasStart = gasleft();
        _;
        uint256 gasSpent = 21000 + gasStart - gasleft() + 7 * msg.data.length;
        ChiToken(CHI).freeFromUpTo(msg.sender, (gasSpent + 25171) / 41852);
    }

    /**
     * @notice Returns tokens mistakenly sent to this contract.
     * @param token Address of token.
     * @param beneficiary Address that will receive tokens.
     * @param amount Amount of tokens to return.
     * @dev Can be called only by this contract's owner.
     */
    function returnLostTokens(
        address token,
        address payable beneficiary,
        uint256 amount
    ) external onlyOwner {
        Base.transfer(token, beneficiary, amount);
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * Uses CHI tokens previously approved by the msg.sender.
     * @param input Token and amount (relative or absolute) to be taken from the account address.
     * Permit type and calldata may provided if possible.
     * @param absoluteOutput Token and absolute amount requirement for the returned token.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @param account Address of the account that will receive the returned tokens.
     * @param salt Number that makes this data unique.
     * @param signature EIP712-compatible signature of data.
     * @return inputBalanceChange Input token balance change.
     * @return outputBalanceChange Output token balance change.
     */
    function executeWithCHI(
        Input calldata input,
        AbsoluteTokenAmount calldata absoluteOutput,
        SwapDescription calldata swapDescription,
        address account,
        uint256 salt,
        bytes calldata signature
    ) external payable useCHI returns (uint256 inputBalanceChange, uint256 outputBalanceChange) {
        bytes32 hashedData = hashData(input, absoluteOutput, swapDescription, account, salt);
        require(account == getAccountFromSignature(hashedData, signature), "R: bad signature");

        markHashUsed(hashedData, account);

        return execute(input, absoluteOutput, swapDescription, account);
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * Uses CHI tokens previously approved by the msg.sender.
     * @param input Token and amount (relative or absolute) to be taken from the account address.
     * Permit type and calldata may provided if possible.
     * @param absoluteOutput Token and absolute amount requirement for the returned token.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @return inputBalanceChange Input token balance change.
     * @return outputBalanceChange Output token balance change.
     */
    function executeWithCHI(
        Input calldata input,
        AbsoluteTokenAmount calldata absoluteOutput,
        SwapDescription calldata swapDescription
    ) external payable useCHI returns (uint256 inputBalanceChange, uint256 outputBalanceChange) {
        return execute(input, absoluteOutput, swapDescription, payable(msg.sender));
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * @param input Token and amount (relative or absolute) to be taken from the account address.
     * Permit type and calldata may provided if possible.
     * @param absoluteOutput Token and absolute amount requirement for the returned token.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @param account Address of the account that will receive the returned tokens.
     * @param salt Number that makes this data unique.
     * @param signature EIP712-compatible signature of data.
     * @return inputBalanceChange Input token balance change.
     * @return outputBalanceChange Output token balance change.
     */
    function execute(
        Input calldata input,
        AbsoluteTokenAmount calldata absoluteOutput,
        SwapDescription calldata swapDescription,
        address account,
        uint256 salt,
        bytes calldata signature
    ) external payable returns (uint256 inputBalanceChange, uint256 outputBalanceChange) {
        bytes32 hashedData = hashData(input, absoluteOutput, swapDescription, account, salt);
        require(account == getAccountFromSignature(hashedData, signature), "R: bad signature");

        markHashUsed(hashedData, account);

        return execute(input, absoluteOutput, swapDescription, account);
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * @param input Token and amount (relative or absolute) to be taken from the account address.
     * Permit type and calldata may provided if possible.
     * @param absoluteOutput Token and absolute amount requirement for the returned token.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @return inputBalanceChange Input token balance change.
     * @return outputBalanceChange Output token balance change.
     */
    function execute(
        Input calldata input,
        AbsoluteTokenAmount calldata absoluteOutput,
        SwapDescription calldata swapDescription
    ) external payable returns (uint256 inputBalanceChange, uint256 outputBalanceChange) {
        return execute(input, absoluteOutput, swapDescription, payable(msg.sender));
    }

    /**
     * @dev Executes actions and returns tokens to account.
     * @param input Token and amount (relative or absolute) to be taken from the account address.
     * Permit type and calldata may provided if possible.
     * @param absoluteOutput Token and absolute amount requirement for the returned token.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @param account Address of the account that will receive the returned tokens.
     * @return inputBalanceChange Input token balance change.
     * @return outputBalanceChange Output token balance change.
     */
    function execute(
        Input calldata input,
        AbsoluteTokenAmount calldata absoluteOutput,
        SwapDescription calldata swapDescription,
        address account
    ) internal returns (uint256 inputBalanceChange, uint256 outputBalanceChange) {
        // Calculate absolute amount in case it was relative.
        uint256 absoluteInputAmount = getAbsoluteAmount(input.tokenAmount, account);

        // Calculate the initial balances for input and output tokens.
        uint256 initialInputBalance = getInputBalance(input.tokenAmount.token, account);
        uint256 initialOutputBalance = Base.getBalance(absoluteOutput.token, account);

        // Get the exact amount required for the caller.
        uint256 exactInputAmount = getExactInputAmount(absoluteInputAmount, swapDescription);
        require(exactInputAmount <= absoluteInputAmount, "R: high exact input");

        // Transfer input token (except ETH) to destination address and handle fees (if any).
        handleInput(input, absoluteInputAmount, exactInputAmount, swapDescription, account);

        // Execute swap(s) in a caller contract.
        require(swapDescription.caller != address(0), "R: zero caller");

        Base.externalCall(
            swapDescription.caller,
            Caller.callBytes.selector,
            abi.encodePacked(swapDescription.callData, account),
            input.tokenAmount.token == ETH ? exactInputAmount : 0,
            ""
        );

        // Calculate the balances changes for input and output tokens.
        inputBalanceChange =
            initialInputBalance -
            getInputBalance(input.tokenAmount.token, account);
        outputBalanceChange =
            Base.getBalance(absoluteOutput.token, account) -
            initialOutputBalance;

        // Refund Ether if necessary.
        if (input.tokenAmount.token == ETH && absoluteInputAmount > inputBalanceChange) {
            Base.transferEther(
                account,
                absoluteInputAmount - inputBalanceChange,
                "R: bad account"
            );
        }

        // Check the requirements for the input and output tokens.
        require(inputBalanceChange <= absoluteInputAmount, "R: high input");
        require(outputBalanceChange >= absoluteOutput.absoluteAmount, "R: low output");

        // Emit event so one could track the swap.
        emitExecuted(
            input,
            absoluteInputAmount,
            inputBalanceChange,
            absoluteOutput,
            outputBalanceChange,
            swapDescription,
            account
        );

        // Return tokens' addresses and amounts that were unfixed.
        return (inputBalanceChange, outputBalanceChange);
    }
}
