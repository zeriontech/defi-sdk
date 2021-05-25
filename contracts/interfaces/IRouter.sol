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

pragma solidity 0.8.4;

import { SwapType } from "../shared/Enums.sol";
import { AbsoluteTokenAmount, Input, SwapDescription } from "../shared/Structs.sol";

interface IRouter {
    /**
     * @notice Emits swap info.
     * @param inputToken Input token of the swap.
     * @param absoluteInputAmount Max amount of input token to be spent.
     * @param absoluteInputAmount Actual amount of input token spent.
     * @param outputToken Output token of the swap.
     * @param absoluteOutputAmount Max amount of output token to be spent.
     * @param actualOutputAmount Actual amount of output token spent.
     * @param swapType Swap type (fixed inputs or fixed outputs).
     * @param share Fee share.
     * @param beneficiary Fee beneficiary.
     * @param destination Destination for the input token.
     * @param core Address of the core contract.
     * @param account Address that swapped tokens.
     * @param sender Address that called the Router contract.
     */
    event Executed(
        address indexed inputToken,
        uint256 absoluteInputAmount,
        uint256 actualInputAmount,
        address indexed outputToken,
        uint256 absoluteOutputAmount,
        uint256 actualOutputAmount,
        SwapType swapType,
        uint256 share,
        address beneficiary,
        address destination,
        address core,
        address indexed account,
        address sender
    );

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
    ) external payable returns (uint256 inputBalanceChange, uint256 outputBalanceChange);

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
    ) external payable returns (uint256 inputBalanceChange, uint256 outputBalanceChange);

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
    ) external payable returns (uint256 inputBalanceChange, uint256 outputBalanceChange);

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
    ) external payable returns (uint256 inputBalanceChange, uint256 outputBalanceChange);

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
    ) external;
}
