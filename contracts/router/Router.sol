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

import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { SignatureVerifier } from "./SignatureVerifier.sol";
import { IChiToken } from "../interfaces/IChiToken.sol";
import { ICaller } from "../interfaces/ICaller.sol";
import { IDAIPermit } from "../interfaces/IDAIPermit.sol";
import { IEIP2612 } from "../interfaces/IEIP2612.sol";
import { IRouter } from "../interfaces/IRouter.sol";
import { IYearnPermit } from "../interfaces/IYearnPermit.sol";
import { Base } from "../shared/Base.sol";
import { Helpers } from "../shared/Helpers.sol";
import { Ownable } from "../shared/Ownable.sol";
import {
    AbsoluteTokenAmount,
    AmountType,
    Input,
    Permit,
    PermitType,
    SwapType,
    SwapDescription,
    TokenAmount
} from "../shared/Structs.sol";

contract Router is IRouter, Ownable, SignatureVerifier("Zerion Router", "2"), ReentrancyGuard {
    uint256 internal constant FEE_LIMIT = 1e16; // 1%
    uint256 internal constant DELIMITER = 1e18; // 100%
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
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
        IChiToken(CHI).freeFromUpTo(msg.sender, (gasSpent + 25171) / 41852);
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
    ) external override onlyOwner {
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
    )
        external
        payable
        override
        useCHI
        nonReentrant
        returns (uint256 inputBalanceChange, uint256 outputBalanceChange)
    {
        return execute(input, absoluteOutput, swapDescription, account, salt, signature);
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
    )
        external
        payable
        override
        useCHI
        nonReentrant
        returns (uint256 inputBalanceChange, uint256 outputBalanceChange)
    {
        return execute(input, absoluteOutput, swapDescription);
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
    )
        public
        payable
        override
        nonReentrant
        returns (uint256 inputBalanceChange, uint256 outputBalanceChange)
    {
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
    )
        public
        payable
        override
        nonReentrant
        returns (uint256 inputBalanceChange, uint256 outputBalanceChange)
    {
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
            ICaller.callBytes.selector,
            abi.encodePacked(swapDescription.callData, account),
            input.tokenAmount.token == ETH ? exactInputAmount : 0
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

    /**
     * @dev Transfers input token from the accound address to the destination address.
     * Calls permit() function if allowance is not enough.
     * Handles fee if required.
     * @param input Token and amount (relative or absolute) to be taken from the account address.
     * Permit type and calldata may provided if possible.
     * @param absoluteInputAmount Input token absolute amount allowed to be taken.
     * @param exactInputAmount Input token amount that should be passed to the destination.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @param account Address of the account to transfer tokens from.
     */
    function handleInput(
        Input calldata input,
        uint256 absoluteInputAmount,
        uint256 exactInputAmount,
        SwapDescription calldata swapDescription,
        address account
    ) internal {
        if (input.tokenAmount.token == ETH) {
            handleETHInput(absoluteInputAmount, exactInputAmount, swapDescription);
        } else {
            handleTokenInput(
                input.tokenAmount.token,
                input.permit,
                absoluteInputAmount,
                exactInputAmount,
                swapDescription,
                account
            );
        }
    }

    /**
     * @dev Handles Ether fee if required.
     * @param absoluteInputAmount Ether absolute amount allowed to be taken.
     * @param exactInputAmount Ether amount that should be passed to the destination.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     */
    function handleETHInput(
        uint256 absoluteInputAmount,
        uint256 exactInputAmount,
        SwapDescription calldata swapDescription
    ) internal {
        require(msg.value >= absoluteInputAmount, "BR: bad msg.value");

        uint256 feeAmount = getFeeAmount(absoluteInputAmount, exactInputAmount, swapDescription);

        if (feeAmount > 0) {
            Base.transferEther(swapDescription.fee.beneficiary, feeAmount, "BR: fee");
        }
    }

    /**
     * @dev Transfers token from the accound address to the destination address.
     * Calls permit() function in case allowance is not enough.
     * Handles fee if required.
     * @param token Token to be taken from the account address.
     * @param permit Permit type and calldata used in case allowance is not enough.
     * @param absoluteInputAmount Input token absolute amount allowed to be taken.
     * @param exactInputAmount Input token amount that should be passed to the destination.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @param account Address of the account to transfer tokens from.
     */
    function handleTokenInput(
        address token,
        Permit calldata permit,
        uint256 absoluteInputAmount,
        uint256 exactInputAmount,
        SwapDescription calldata swapDescription,
        address account
    ) internal {
        if (token == address(0)) {
            require(absoluteInputAmount == 0, "BR: zero token");
            return;
        }

        if (absoluteInputAmount > IERC20(token).allowance(account, address(this))) {
            Base.externalCall(
                token,
                getPermitSelector(permit.permitType),
                permit.permitCallData,
                0
            );
        }

        uint256 feeAmount = getFeeAmount(absoluteInputAmount, exactInputAmount, swapDescription);

        if (feeAmount > 0) {
            SafeERC20.safeTransferFrom(
                IERC20(token),
                account,
                swapDescription.fee.beneficiary,
                feeAmount
            );
        }

        SafeERC20.safeTransferFrom(
            IERC20(token),
            account,
            swapDescription.destination,
            exactInputAmount
        );
    }

    /**
     * @notice Emits `Executed` event with all the necessary data.
     * @param input Token and amount (relative or absolute) to be taken from the account address.
     * @param absoluteInputAmount Absolute amount of token to be taken from the account address.
     * @param inputBalanceChange Actual amount of token taken from the account address.
     * @param absoluteOutput Token and absolute amount requirement for the returned token.
     * @param outputBalanceChange Actual amount of token returned to the account address.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @param account Address of the account that will receive the returned tokens.
     */
    function emitExecuted(
        Input calldata input,
        uint256 absoluteInputAmount,
        uint256 inputBalanceChange,
        AbsoluteTokenAmount calldata absoluteOutput,
        uint256 outputBalanceChange,
        SwapDescription calldata swapDescription,
        address account
    ) internal {
        emit Executed(
            input.tokenAmount.token,
            absoluteInputAmount,
            inputBalanceChange,
            absoluteOutput.token,
            absoluteOutput.absoluteAmount,
            outputBalanceChange,
            swapDescription.swapType,
            swapDescription.fee.share,
            swapDescription.fee.beneficiary,
            swapDescription.destination,
            swapDescription.caller,
            account,
            msg.sender
        );
    }

    /**
     * @param account Address of the account to transfer token from.
     * @param tokenAmount Token address, its amount, and amount type.
     * @return Absolute token amount.
     */
    function getAbsoluteAmount(TokenAmount calldata tokenAmount, address account)
        internal
        view
        returns (uint256)
    {
        AmountType amountType = tokenAmount.amountType;
        require(
            amountType == AmountType.Relative || amountType == AmountType.Absolute,
            "BR: bad amount type"
        );

        if (amountType == AmountType.Absolute) {
            return tokenAmount.amount;
        }

        require(tokenAmount.token != address(0) && tokenAmount.token != ETH, "BR: bad token");
        require(tokenAmount.amount <= DELIMITER, "BR: bad amount");
        if (tokenAmount.amount == DELIMITER) {
            return IERC20(tokenAmount.token).balanceOf(account);
        } else {
            return (IERC20(tokenAmount.token).balanceOf(account) * tokenAmount.amount) / DELIMITER;
        }
    }

    /**
     * @notice Calculates the exact amount of the input tokens in case of fixed output amount.
     * @param absoluteInputAmount Maximum input tokens amount.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @return exactInputAmount Input amount that should be passed to the caller.
     * @dev Implementation of Caller interface function.
     */
    function getExactInputAmount(
        uint256 absoluteInputAmount,
        SwapDescription calldata swapDescription
    ) internal view returns (uint256 exactInputAmount) {
        SwapType swapType = swapDescription.swapType;
        require(
            swapType == SwapType.FixedInputs || swapType == SwapType.FixedOutputs,
            "R: bad swapType"
        );

        if (swapType == SwapType.FixedInputs) {
            if (swapDescription.fee.share > 0) {
                require(swapDescription.fee.beneficiary != address(0), "R: zero beneficiary");
                require(swapDescription.fee.share <= FEE_LIMIT, "R: bad fee");

                return (absoluteInputAmount * (DELIMITER - swapDescription.fee.share)) / DELIMITER;
            }

            return absoluteInputAmount;
        }

        bytes memory returnData =
            Base.staticCall(
                swapDescription.caller,
                ICaller.getExactInputAmount.selector,
                swapDescription.callData
            );
        require(returnData.length == 32, "BR: bad exactInputAmount");
        return abi.decode(returnData, (uint256));
    }

    /**
     * @notice Calculates the input token balance for the given account.
     * @param token Adress of the token.
     * @param account Adress of the account.
     * @dev In case of Ether, this contract balance should be taken into account.
     */
    function getInputBalance(address token, address account)
        internal
        view
        returns (uint256 inputBalance)
    {
        if (token == ETH) {
            return Base.getBalance(ETH, address(this));
        }

        return Base.getBalance(token, account);
    }

    /**
     * @param permitType PermitType enum variable with permit type.
     * @return permit() function signature corresponding to the given permit type.
     */
    function getPermitSelector(PermitType permitType) internal pure returns (bytes4) {
        require(
            permitType == PermitType.EIP2612 ||
                permitType == PermitType.DAI ||
                permitType == PermitType.Yearn,
            "BR: bad permit type"
        );

        // Constants of non-value type not yet implemented,
        // so we have to use else-if's.
        //    bytes4[3] internal constant PERMIT_SELECTORS = [
        //        // PermitType.EIP2612
        //        // keccak256(abi.encodePacked('permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'))
        //        0xd505accf,
        //        // PermitType.DAI
        //        // keccak256(abi.encodePacked('permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)'))
        //        0x8fcbaf0c,
        //        // PermitType.Yearn
        //        // keccak256(abi.encodePacked('permit(address,address,uint256,uint256,bytes)'))
        //        0x9fd5a6cf
        //    ];

        if (permitType == PermitType.EIP2612) {
            return IEIP2612.permit.selector;
        } else if (permitType == PermitType.DAI) {
            return IDAIPermit.permit.selector;
        } else if (permitType == PermitType.Yearn) {
            return IYearnPermit.permit.selector;
        } else {
            return bytes4(0);
        }
    }

    /**
     * @dev Calculates fee.
     *     - In case of fixed inputs, fee is the difference between
     *         `absoluteInputAmount` and `exactInputAmount`.
     *         This proves that inputs are fixed.
     *     - In case of fixed outputs, fee is share of `exactInputAmount`,
     *         bounded by the difference between `absoluteInputAmount` and `exactInputAmount`.
     *         This proves that inputs are bounded by `absoluteInputAmount`.
     * @param absoluteInputAmount Input token absolute amount allowed to be taken.
     * @param exactInputAmount Input token amount that should be passed to the destination.
     * @param swapDescription Swap description with the following elements:
     *     - Whether the inputs or outputs are fixed.
     *     - Fee share and beneficiary address.
     *     - Address of the destination for the tokens transfer.
     *     - Address of the Caller contract to be called.
     *     - Calldata for the call to the Caller contract.
     * @return feeAmount Amount of fee.
     */
    function getFeeAmount(
        uint256 absoluteInputAmount,
        uint256 exactInputAmount,
        SwapDescription calldata swapDescription
    ) internal pure returns (uint256 feeAmount) {
        if (swapDescription.swapType == SwapType.FixedInputs) {
            return absoluteInputAmount - exactInputAmount;
        }

        uint256 expectedFeeAmount = (exactInputAmount * swapDescription.fee.share) / DELIMITER;
        uint256 maxFeeAmount = absoluteInputAmount - exactInputAmount;

        return expectedFeeAmount > maxFeeAmount ? maxFeeAmount : expectedFeeAmount;
    }
}
