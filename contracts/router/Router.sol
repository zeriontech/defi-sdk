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
    BadAmount,
    BadAccount,
    BadAccountSignature,
    BadAmountType,
    BadFeeAmount,
    BadFeeBeneficiary,
    BadFeeShare,
    BadFeeSignature,
    ExceedingDelimiterAmount,
    ExceedingLimitFee,
    HighInputBalanceChange,
    InsufficientAllowance,
    InsufficientMsgValue,
    LowOutputBalanceChange,
    NoneAmountType,
    NonePermitType,
    NoneSwapType,
    PassedDeadline
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
    function cancelAccountSignature(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription,
        AccountSignature calldata accountSignature
    ) external override nonReentrant {
        if (msg.sender != swapDescription.account)
            revert BadAccount(msg.sender, swapDescription.account);

        validateAccountSignature(input, output, swapDescription, accountSignature);
    }

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
     * @dev Takse tokens from the user, executes the swap,
     *     do the security checks, and all the required transfers
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

        // Transfer input token (`msg.value` check for Ether) to this contract address,
        // except for the case of zero input token address
        address inputToken = input.tokenAmount.token;
        if (inputToken != address(0))
            handleInput(inputToken, absoluteInputAmount, input.permit, swapDescription.account);

        // No need to save initial balances, so the following code is placed in a separate block
        {
            // Calculate the initial balances for input and output tokens
            uint256 initialInputBalance = Base.getBalance(inputToken);
            uint256 initialOutputBalance = Base.getBalance(output.token);

            // Transfer tokens and call the caller with the provided call data
            transferAndCall(inputToken, absoluteInputAmount, swapDescription);

            // Calculate the balance changes for input and output tokens
            inputBalanceChange = initialInputBalance - Base.getBalance(inputToken);
            outputBalanceChange = Base.getBalance(output.token) - initialOutputBalance;
        }

        // Return the remaining input tokens (if necessary) and distribute output tokens and fees
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
            ) = getReturnedAmounts(swapDescription, output, outputBalanceChange);

            // Check output requirements, prevent revert on transfers
            if (returnedAmount < output.absoluteAmount)
                revert LowOutputBalanceChange(returnedAmount, output.absoluteAmount);

            // Transfer the refund back to the user
            Base.transfer(inputToken, swapDescription.account, refundAmount);

            // Do the rest of transfers in case output token address is not zero
            if (output.token != address(0)) {
                // Transfer the output tokens to the user
                Base.transfer(output.token, swapDescription.account, returnedAmount);

                // Transfer protocol fee
                Base.transfer(
                    output.token,
                    swapDescription.protocolFee.beneficiary,
                    protocolFeeAmount
                );

                // Transfer marketplace fee
                Base.transfer(
                    output.token,
                    swapDescription.marketplaceFee.beneficiary,
                    marketplaceFeeAmount
                );
            }

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
     * @param token Input token address (may be Ether)
     * @param amount Input token amount
     * @param permit Permit type and call data, which is used if allowance is not enough
     * @param account Address of the account to take tokens from
     */
    function handleInput(
        address token,
        uint256 amount,
        Permit calldata permit,
        address account
    ) internal {
        if (token == ETH) {
            handleETHInput(amount);
        } else {
            handleTokenInput(token, amount, permit, account);
        }
    }

    /**
     * @dev Checks `msg.value` to be greater or equal to the Ether absolute amount to be used
     * @param amount Ether absolute amount to be used
     */
    function handleETHInput(uint256 amount) internal {
        if (msg.value < amount) {
            revert InsufficientMsgValue(msg.value, amount);
        }
    }

    /**
     * @dev Transfers input token from the accound address to this contract,
     *     calls `permit()` function if allowance is not enough and permit call data is provided
     * @param token Token to be taken from the account address
     * @param amount Input token absolute amount to be taken from the account
     * @param permit Permit type and call data, which is used if allowance is not enough
     * @param account Address of the account to take tokens from
     */
    function handleTokenInput(
        address token,
        uint256 amount,
        Permit calldata permit,
        address account
    ) internal {
        uint256 allowance = IERC20(token).allowance(account, address(this));
        if (allowance < amount) {
            if (permit.permitCallData.length == uint256(0))
                revert InsufficientAllowance(allowance, amount);

            Address.functionCall(
                token,
                abi.encodePacked(getPermitSelector(permit.permitType), permit.permitCallData),
                "R: permit"
            );
        }

        SafeERC20.safeTransferFrom(IERC20(token), account, address(this), amount);
    }

    /**
     * @dev Transfers input tokens (if necessary) and calls the caller with the provided call data
     * @param token Token to be taken from this contract address
     * @param amount Amount of the token to be sent to the caller
     * @param swapDescription Swap parameters described in `execute()` function
     */
    function transferAndCall(
        address token,
        uint256 amount,
        SwapDescription calldata swapDescription
    ) internal {
        if (token != address(0)) Base.transfer(token, swapDescription.caller, amount);

        Address.functionCall(
            swapDescription.caller,
            abi.encodeWithSelector(
                ICaller.callBytes.selector,
                AbsoluteTokenAmount({ token: token, absoluteAmount: amount }),
                swapDescription.callerCallData
            ),
            "R: callBytes failed w/ no reason"
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
     * @dev Validates signature for the account and marks it as used
     * @dev All the parameters are described in `execute()` function
     * @dev In case of empty signature, account address must be equal to the sender address
     */
    function validateAccountSignature(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription,
        AccountSignature calldata accountSignature
    ) internal {
        if (accountSignature.signature.length == uint256(0)) {
            if (msg.sender != swapDescription.account)
                revert BadAccount(msg.sender, swapDescription.account);
            return;
        }
        bytes32 hashedAccountSignatureData = hashAccountSignatureData(
            input,
            output,
            swapDescription,
            accountSignature.salt
        );

        if (
            !SignatureChecker.isValidSignatureNow(
                swapDescription.account,
                hashedAccountSignatureData,
                accountSignature.signature
            )
        ) revert BadAccountSignature();

        markHashUsed(hashedAccountSignatureData);
    }

    /**
     * @dev Validates protocol fee signature
     * @dev All the parameters are described in `execute()` function
     * @dev In case of empty signature, protocol fee must be equal to the default one
     * @dev Signature is valid only until the deadline
     * @dev Custom protocol fee can be lower or equal to the default one
     */
    function validateProtocolFeeSignature(
        Input calldata input,
        AbsoluteTokenAmount calldata output,
        SwapDescription calldata swapDescription,
        ProtocolFeeSignature calldata protocolFeeSignature
    ) internal view {
        Fee memory baseProtocolFee = getProtocolFeeDefault();
        Fee memory protocolFee = swapDescription.protocolFee;

        if (protocolFeeSignature.signature.length == uint256(0)) {
            if (protocolFee.share != baseProtocolFee.share)
                revert BadFeeShare(protocolFee.share, baseProtocolFee.share);
            if (protocolFee.beneficiary != baseProtocolFee.beneficiary)
                revert BadFeeBeneficiary(protocolFee.beneficiary, baseProtocolFee.beneficiary);
            return;
        }

        if (protocolFee.share > baseProtocolFee.share)
            revert ExceedingLimitFee(protocolFee.share, baseProtocolFee.share);

        bytes32 hashedProtocolFeeSignatureData = hashProtocolFeeSignatureData(
            input,
            output,
            swapDescription,
            protocolFeeSignature.deadline
        );

        if (
            !SignatureChecker.isValidSignatureNow(
                getProtocolFeeSigner(),
                hashedProtocolFeeSignatureData,
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
     * @dev Relative amount type cannot be used with Ether or zero token address
     * @dev Only zero amount can be used with zero token address
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
        address token = tokenAmount.token;
        uint256 amount = tokenAmount.amount;

        if (amountType == AmountType.None) revert NoneAmountType();

        if (token == address(0) && amount != uint256(0)) revert BadAmount(amount, uint256(0));

        if (amountType == AmountType.Absolute) return amount;

        if (token == ETH || token == address(0))
            revert BadAmountType(amountType, AmountType.Absolute);

        if (amount > DELIMITER) revert ExceedingDelimiterAmount(amount);

        if (amount == DELIMITER) return IERC20(token).balanceOf(account);

        return (IERC20(token).balanceOf(account) * amount) / DELIMITER;
    }

    /**
     * @dev Calculates returned amount, protocol fee amount, and marketplace fee amount
     *     - In case of fixed inputs, returned amount is
     *         `outputBalanceChange` multiplied by (1 - total fee share)
     *         This shows that actual fee is a share of output
     *     - In case of fixed outputs, returned amount is `outputAmount`
     *         This proves that outputs are fixed
     * @param swapDescription Swap parameters described in `execute()` function
     * @param output Output token and absolute amount required to be returned
     * @param outputBalanceChange Output token absolute amount actually returned
     * @return returnedAmount Amount of output token returned to the account
     * @return protocolFeeAmount Amount of output token sent to the protocol fee beneficiary
     * @return marketplaceFeeAmount Amount of output token sent to the marketplace fee beneficiary
     * @dev Returns all zeroes in case of zero output token
     */
    function getReturnedAmounts(
        SwapDescription calldata swapDescription,
        AbsoluteTokenAmount calldata output,
        uint256 outputBalanceChange
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

        if (output.token == address(0)) {
            if (output.absoluteAmount != uint256(0))
                revert BadAmount(output.absoluteAmount, uint256(0));
            return (0, 0, 0);
        }

        uint256 totalFeeShare = swapDescription.protocolFee.share +
            swapDescription.marketplaceFee.share;

        if (totalFeeShare == uint256(0)) return (outputBalanceChange, 0, 0);

        if (totalFeeShare > DELIMITER) revert BadFeeShare(totalFeeShare, DELIMITER);

        // The most tricky and gentle place connected with fees
        // We return either the amount the user requested
        // or the output balance change divided by (1 + fee percentage)
        // Minus one in the denominator is used to eliminate precision issues
        returnedAmount = (swapDescription.swapType == SwapType.FixedOutputs)
            ? output.absoluteAmount
            : ((outputBalanceChange * DELIMITER) / (DELIMITER + totalFeeShare - 1));

        uint256 totalFeeAmount = outputBalanceChange - returnedAmount;

        // This check is important in fixed outputs case as we never actually check that
        // total fee amount is not too large and should always just pass in fixed inputs case
        if (totalFeeAmount * DELIMITER > totalFeeShare * returnedAmount)
            revert BadFeeAmount(totalFeeAmount, (returnedAmount * totalFeeShare) / DELIMITER);

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
        // There is no else case here, however, is marked as uncovered by tests
    }
}
