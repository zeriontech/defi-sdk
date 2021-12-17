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

import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { ICaller } from "../interfaces/ICaller.sol";
import { IDAIPermit } from "../interfaces/IDAIPermit.sol";
import { IEIP2612 } from "../interfaces/IEIP2612.sol";
import { IRouter } from "../interfaces/IRouter.sol";
import { IYearnPermit } from "../interfaces/IYearnPermit.sol";
import { Base } from "../shared/Base.sol";
import { AmountType, PermitType, SwapType } from "../shared/Enums.sol";
import {
    BadAccount,
    BadAccountSignature,
    BadAbsoluteInputAmount,
    BadAmountType,
    BadFeeAmount,
    BadFeeBeneficiary,
    BadFeeShare,
    BadFeeSignature,
    ExceedingDelimiterAmount,
    ExceedingLimitFee,
    InsufficientAllowance,
    InsufficientMsgValue,
    LowOutputBalanceChange,
    HighInputBalanceChange,
    NoneAmountType,
    NonePermitType,
    NoneSwapType,
    PassedDeadline,
    ZeroFeeBeneficiary,
    ZeroSigner
} from "../shared/Errors.sol";
import { Ownable } from "../shared/Ownable.sol";
import {
    AbsoluteTokenAmount,
    AccountSignature,
    Fee,
    ProtocolFeeSignature,
    Input,
    Permit,
    SwapDescription,
    TokenAmount
} from "../shared/Structs.sol";
import { TokensHandler } from "../shared/TokensHandler.sol";

import { ProtocolFee } from "./ProtocolFee.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";

// solhint-disable code-complexity
contract Router is
    IRouter,
    Ownable,
    TokensHandler,
    SignatureVerifier("Zerion Router", "2"),
    ProtocolFee,
    ReentrancyGuard
{
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @inheritdoc IRouter
     */
    function execute(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription,
        AccountSignature calldata accountSignature,
        ProtocolFeeSignature calldata protocolFeeSignature
    )
        external
        payable
        override
        nonReentrant
        returns (uint256 inputBalanceChange, uint256 outputBalanceChange)
    {
        validateProtocolFeeSignature(input, output, swapDescription, protocolFeeSignature);
        validateAccountSignature(input, output, swapDescription, accountSignature);

        return execute(input, output, swapDescription);
    }

    /**
     * @dev Executes actions and returns tokens to account
     * @dev All the parameters are described in `execute()` function
     */
    function execute(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription
    ) internal returns (uint256 inputBalanceChange, uint256 outputBalanceChange) {
        // Calculate absolute amount in case it was relative
        uint256 absoluteInputAmount = getAbsoluteInputAmount(
            input.tokenAmount,
            swapDescription.account
        );

        // Transfer input token (msg.value check for ETH) to this address
        handleInput(input, absoluteInputAmount, swapDescription.account);

        // Calculate the initial balances for input and output tokens
        uint256 initialInputBalance = Base.getBalance(input.tokenAmount.token);
        uint256 initialOutputBalance = Base.getBalance(output.token);

        // Approve tokens (if necessary) and call the caller with the given call data
        approveAndCall(
            input.tokenAmount.token,
            absoluteInputAmount,
            swapDescription.caller,
            swapDescription.callerCallData
        );

        // Calculate the balance changes for input and output tokens
        inputBalanceChange = initialInputBalance - Base.getBalance(input.tokenAmount.token);
        outputBalanceChange = Base.getBalance(output.token) - initialOutputBalance;

        // Refund (if necessary) and distribute return and fees amounts
        {
            // Check input requirements, prevent the underflow
            if (inputBalanceChange > absoluteInputAmount)
                revert HighInputBalanceChange(inputBalanceChange, absoluteInputAmount);

            // Calculate the refund amount
            uint256 refundAmount = absoluteInputAmount - inputBalanceChange;

            // Calculate returned output token amount and fees amounts
            (
                uint256 returnedAmount,
                uint256 protocolFeeAmount,
                uint256 marketplaceFeeAmount
            ) = getReturnedAmounts(swapDescription, outputBalanceChange, output.absoluteAmount);

            // Check output requirements, prevent revert on transfers
            if (returnedAmount < output.absoluteAmount) {
                revert LowOutputBalanceChange(returnedAmount, output.absoluteAmount);
            }

            // Do all the required transfers
            Base.transfer(input.tokenAmount.token, swapDescription.account, refundAmount);

            Base.transfer(output.token, swapDescription.account, returnedAmount);

            Base.transfer(
                output.token,
                swapDescription.protocolFee.beneficiary,
                protocolFeeAmount
            );

            Base.transfer(
                output.token,
                swapDescription.marketplaceFee.beneficiary,
                marketplaceFeeAmount
            );

            // Emit event so one could track the swap
            emitExecuted(
                input,
                output,
                swapDescription,
                absoluteInputAmount,
                inputBalanceChange,
                returnedAmount,
                protocolFeeAmount,
                marketplaceFeeAmount
            );
        }

        // Return this contract's balance changes (output balance includes fee)
        return (inputBalanceChange, outputBalanceChange);
    }

    /**
     * @dev Transfers input token from the accound address to this contract,
     *     calls `permit()` function if allowance is not enough and permit call data is provided
     * @param input Input described in `execute()` function
     * @param absoluteInputAmount Input token absolute amount allowed to be taken from the account
     * @param account Address of the account to take tokens from
     */
    function handleInput(
        Input calldata input,
        uint256 absoluteInputAmount,
        address account
    ) internal {
        if (input.tokenAmount.token == ETH) {
            handleETHInput(absoluteInputAmount);
        } else {
            handleTokenInput(input.tokenAmount.token, input.permit, absoluteInputAmount, account);
        }
    }

    /**
     * @dev Checks `msg.value` to be greater than Ether absolute amount allowed to be taken
     * @param absoluteInputAmount Ether absolute amount to be used
     */
    function handleETHInput(uint256 absoluteInputAmount) internal {
        if (msg.value < absoluteInputAmount) {
            revert InsufficientMsgValue(msg.value, absoluteInputAmount);
        }
    }

    /**
     * @dev Transfers input token from the accound address to this contract,
     *     calls `permit()` function if allowance is not enough and permit call data is provided
     * @param token Token to be taken from the account address
     * @param permit Permit type and call data, which used if allowance is not enough
     * @param absoluteInputAmount Input token absolute amount to be taken from the account
     * @param account Address of the account to take tokens from
     */
    function handleTokenInput(
        address token,
        Permit calldata permit,
        uint256 absoluteInputAmount,
        address account
    ) internal {
        if (token == address(0)) {
            if (absoluteInputAmount > 0) {
                revert BadAbsoluteInputAmount(absoluteInputAmount, 0);
            }
            return;
        }

        uint256 allowance = IERC20(token).allowance(account, address(this));
        if (allowance < absoluteInputAmount) {
            if (permit.permitCallData.length == 0)
                revert InsufficientAllowance(allowance, absoluteInputAmount);

            Address.functionCall(
                token,
                abi.encodePacked(getPermitSelector(permit.permitType), permit.permitCallData),
                "R: permit"
            );
        }

        SafeERC20.safeTransferFrom(IERC20(token), account, address(this), absoluteInputAmount);
    }

    /**
     * @dev Approves input tokens (if necessary) and calls the caller with the provided call data
     * @param token Token to be taken from this contract address
     * @param caller Address of the contract that will be called
     * @param callerCallData Call data for the call to the caller
     */
    function approveAndCall(
        address token,
        uint256 amount,
        address caller,
        bytes calldata callerCallData
    ) internal {
        Base.safeApproveMax(token, caller, amount);

        Address.functionCallWithValue(
            caller,
            abi.encodeWithSelector(ICaller.callBytes.selector, callerCallData),
            token == ETH ? amount : 0,
            "R: callBytes"
        );
    }

    /**
     * @notice Emits Executed event
     * @param input Input described in `execute()` function
     * @param output Output described in `execute()` function
     * @param swapDescription Swap parameters described in `execute()` function
     * @param absoluteInputAmount Max amount of input token to be taken from the account address
     * @param inputBalanceChange Actual amount of input token taken from the account address
     * @param returnedAmount Actual amount of tokens returned to the account address
     * @param protocolFeeAmount Protocol fee amount
     * @param marketplaceFeeAmount Marketplace fee amount
     */
    function emitExecuted(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription,
        uint256 absoluteInputAmount,
        uint256 inputBalanceChange,
        uint256 returnedAmount,
        uint256 protocolFeeAmount,
        uint256 marketplaceFeeAmount
    ) internal {
        emit Executed(
            input.tokenAmount.token,
            absoluteInputAmount,
            inputBalanceChange,
            output.token,
            output.absoluteAmount,
            returnedAmount,
            protocolFeeAmount,
            marketplaceFeeAmount,
            swapDescription,
            msg.sender
        );
    }

    /**
     * @dev Validates signature for the account
     * @dev All the parameters are described in `execute()` function
     * @dev In case of empty signature, account address must be equal to the sender address
     */
    function validateAccountSignature(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription,
        AccountSignature calldata accountSignature
    ) internal {
        if (accountSignature.signature.length == 0) {
            if (swapDescription.account != msg.sender)
                revert BadAccount(swapDescription.account, msg.sender);
            return;
        }
        bytes32 hashedData = hashData(input, output, swapDescription, accountSignature.salt);

        if (
            !SignatureChecker.isValidSignatureNow(
                swapDescription.account,
                hashedData,
                accountSignature.signature
            )
        ) revert BadAccountSignature();

        markHashUsed(hashedData);
    }

    /**
     * @dev Validates protocol fee signature
     * @dev All the parameters are described in `execute()` function
     * @dev In case of empty signature, protocol fee must be equat to the default one
     * @dev Signature is valid until th deadline
     * @dev Custom protocol fee can be only lower than the default one
     */
    function validateProtocolFeeSignature(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription,
        ProtocolFeeSignature calldata protocolFeeSignature
    ) internal view {
        Fee memory baseProtocolFee = getProtocolFeeDefault();
        Fee memory protocolFee = swapDescription.protocolFee;

        if (protocolFeeSignature.signature.length == 0) {
            if (protocolFee.share != baseProtocolFee.share)
                revert BadFeeShare(protocolFee.share, baseProtocolFee.share);
            if (protocolFee.beneficiary != baseProtocolFee.beneficiary)
                revert BadFeeBeneficiary(protocolFee.beneficiary, baseProtocolFee.beneficiary);
            return;
        }

        if (protocolFee.share > baseProtocolFee.share)
            revert ExceedingLimitFee(protocolFee.share, baseProtocolFee.share);

        bytes32 hashedData = hashData(
            input,
            output,
            swapDescription,
            protocolFeeSignature.deadline
        );

        if (
            !SignatureChecker.isValidSignatureNow(
                getProtocolFeeSigner(),
                hashedData,
                protocolFeeSignature.signature
            )
        ) revert BadFeeSignature();

        // solhint-disable not-rely-on-time
        if (block.timestamp > protocolFeeSignature.deadline)
            revert PassedDeadline(block.timestamp, protocolFeeSignature.deadline);
        // solhint-enable not-rely-on-time
    }

    /**
     * @dev Calculate absolute input amount given token amount from `execute()` function inputs
     * @param tokenAmount Token address, its amount, and amount type
     * @param account Address of the account to transfer token from
     * @return absoluteTokenAmount Absolute token amount
     */
    function getAbsoluteInputAmount(TokenAmount calldata tokenAmount, address account)
        internal
        view
        returns (uint256 absoluteTokenAmount)
    {
        AmountType amountType = tokenAmount.amountType;

        if (amountType == AmountType.None) revert NoneAmountType();

        if (amountType == AmountType.Absolute) return tokenAmount.amount;

        if (tokenAmount.token == address(0) || tokenAmount.token == ETH)
            revert BadAmountType(amountType, AmountType.Absolute);

        if (tokenAmount.amount > DELIMITER) revert ExceedingDelimiterAmount(tokenAmount.amount);

        if (tokenAmount.amount == DELIMITER) return IERC20(tokenAmount.token).balanceOf(account);

        return (IERC20(tokenAmount.token).balanceOf(account) * tokenAmount.amount) / DELIMITER;
    }

    /**
     * @dev Calculates returned amount, protocol fee amount, and marketplace fee amount
     *     - In case of fixed inputs, returned amount is
     *         `outputBalanceChange` multiplied by (1 - total fee share)
     *         This shows that actual fee is a share of output
     *     - In case of fixed outputs, returned amount is `outputAmount`
     *         This proves that outputs are fixed
     * @param swapDescription Swap parameters described in `execute()` function
     * @param outputAmount Output token absolute amount required to be returned
     * @param outputBalanceChange Output token absolute amount actually returned
     * @return returnedAmount Amount of output token returned to the account
     * @return protocolFeeAmount Amount of output token sent to the protocol fee beneficiary
     * @return marketplaceFeeAmount Amount of output token sent to the marketplace fee beneficiary
     */
    function getReturnedAmounts(
        SwapDescription calldata swapDescription,
        uint256 outputBalanceChange,
        uint256 outputAmount
    )
        internal
        pure
        returns (
            uint256 returnedAmount,
            uint256 protocolFeeAmount,
            uint256 marketplaceFeeAmount
        )
    {
        if (swapDescription.swapType == SwapType.None) revert NoneSwapType();

        uint256 totalFeeShare = swapDescription.protocolFee.share +
            swapDescription.marketplaceFee.share;

        if (totalFeeShare == 0) return (outputBalanceChange, 0, 0);

        if (totalFeeShare > DELIMITER) revert BadFeeShare(totalFeeShare, DELIMITER);

        returnedAmount = (swapDescription.swapType == SwapType.FixedOutputs)
            ? outputAmount
            : (outputBalanceChange * DELIMITER / (DELIMITER + totalFeeShare - 1));

        uint256 totalFeeAmount = outputBalanceChange - returnedAmount;
        if (totalFeeAmount * DELIMITER  > totalFeeShare * returnedAmount)
            revert BadFeeAmount(totalFeeAmount, returnedAmount * totalFeeShare / DELIMITER);

        protocolFeeAmount = (totalFeeAmount * swapDescription.protocolFee.share) / totalFeeShare;
        marketplaceFeeAmount = totalFeeAmount - protocolFeeAmount;
    }

    /**
     * @dev Maps permit type to permit selector
     * @param permitType PermitType enum variable with permit type
     * @return selector permit() function signature corresponding to the given permit type
     */
    function getPermitSelector(PermitType permitType) internal pure returns (bytes4 selector) {
        if (permitType == PermitType.None) revert NonePermitType();

        /*
         * Constants of non-value type not yet implemented, so we have to use else-if's
         *    bytes4[3] internal constant PERMIT_SELECTORS = [
         *        // PermitType.EIP2612
         *        // keccak256(abi.encodePacked(
         *        //     'permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'
         *        // ))
         *        0xd505accf,
         *        // PermitType.DAI
         *        // keccak256(abi.encodePacked(
         *        //     'permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)'
         *        // ))
         *        0x8fcbaf0c,
         *        // PermitType.Yearn
         *        // keccak256(abi.encodePacked('permit(address,address,uint256,uint256,bytes)'))
         *        0x9fd5a6cf
         *    ];
         */
        if (permitType == PermitType.EIP2612) return IEIP2612.permit.selector;
        if (permitType == PermitType.DAI) return IDAIPermit.permit.selector;
        if (permitType == PermitType.Yearn) return IYearnPermit.permit.selector;
    }
}
