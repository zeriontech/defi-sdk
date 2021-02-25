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

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import {
    AbsoluteTokenAmount,
    Action,
    AmountType,
    Fee,
    Input,
    PermitType,
    TokenAmount
} from "../shared/Structs.sol";
import { ERC20 } from "../interfaces/ERC20.sol";
import { SafeERC20 } from "../shared/SafeERC20.sol";
import { Helpers } from "../shared/Helpers.sol";
import { ChiToken } from "../interfaces/ChiToken.sol";
import { Core } from "./Core.sol";
import { BaseRouter } from "./BaseRouter.sol";
import { Base } from "./Base.sol";
import { Ownable } from "./Ownable.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";
import { UniswapRouter } from "./UniswapRouter.sol";

interface Chi {
    function freeFromUpTo(address, uint256) external;
}

contract Router is
    Ownable,
    Base,
    BaseRouter,
    UniswapRouter,
    SignatureVerifier("Zerion Router v1.1")
{
    using SafeERC20 for ERC20;
    using Helpers for address;

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
     * @dev Can be called only by this contract's owner.
     */
    function returnLostTokens(address token, address payable beneficiary) external onlyOwner {
        if (token == ETH) {
            transferEther(beneficiary, address(this).balance, "R: bad beneficiary");
        } else {
            ERC20(token).safeTransfer(beneficiary, ERC20(token).balanceOf(address(this)), "R");
        }
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * Uses CHI tokens previously approved by the msg.sender.
     * @param actions Array of actions to be executed.
     * @param inputs Array of tokens to be taken from the signer of this data.
     * @param fee Fee share and beneficiary address.
     * @param requiredOutputs Array of requirements for the returned tokens.
     * @param account Address of the account that will receive the returned tokens.
     * @param salt Number that makes this data unique.
     * @param signature EIP712-compatible signature of data.
     * @return Array of the returned tokens addresses and absolute amounts.
     */
    function executeWithCHI(
        Action[] calldata actions,
        Input[] calldata inputs,
        Fee calldata fee,
        AbsoluteTokenAmount[] calldata requiredOutputs,
        address account,
        uint256 salt,
        bytes calldata signature
    ) external payable useCHI returns (AbsoluteTokenAmount[] memory) {
        bytes32 hashedData = hashData(actions, inputs, fee, requiredOutputs, account, salt);
        require(account == getAccountFromSignature(hashedData, signature), "R: wrong account");

        markHashUsed(hashedData, account);

        return execute(actions, inputs, fee, requiredOutputs, account);
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * Uses CHI tokens previously approved by the msg.sender.
     * @param actions Array of actions to be executed.
     * @param inputs Array of tokens to be taken from the msg.sender.
     * @param fee Fee share and beneficiary address.
     * @param requiredOutputs Array of requirements for the returned tokens.
     * @return Array of the returned tokens addresses and absolute amounts.
     */
    function executeWithCHI(
        Action[] calldata actions,
        Input[] calldata inputs,
        Fee calldata fee,
        AbsoluteTokenAmount[] calldata requiredOutputs
    ) external payable useCHI returns (AbsoluteTokenAmount[] memory) {
        return execute(actions, inputs, fee, requiredOutputs, msg.sender);
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * @param actions Array of actions to be executed.
     * @param inputs Array of tokens to be taken from the signer of this data.
     * @param fee Fee share and beneficiary address.
     * @param requiredOutputs Array of requirements for the returned tokens.
     * @param account Address of the account that will receive the returned tokens.
     * @param salt Number that makes this data unique.
     * @param signature EIP712-compatible signature of data.
     * @return Array of the returned tokens addresses and absolute amounts.
     */
    function execute(
        Action[] calldata actions,
        Input[] calldata inputs,
        Fee calldata fee,
        AbsoluteTokenAmount[] calldata requiredOutputs,
        address account,
        uint256 salt,
        bytes calldata signature
    ) external payable returns (AbsoluteTokenAmount[] memory) {
        bytes32 hashedData = hashData(actions, inputs, fee, requiredOutputs, account, salt);
        require(account == getAccountFromSignature(hashedData, signature), "R: wrong account");

        markHashUsed(hashedData, account);

        return execute(actions, inputs, fee, requiredOutputs, account);
    }

    /**
     * @notice Executes actions and returns tokens to account.
     * @param actions Array of actions to be executed.
     * @param inputs Array of tokens to be taken from the msg.sender.
     * @param fee Fee share and beneficiary address.
     * @param requiredOutputs Array of requirements for the returned tokens.
     * @return Array of the returned tokens addresses and absolute amounts.
     */
    function execute(
        Action[] calldata actions,
        Input[] calldata inputs,
        Fee calldata fee,
        AbsoluteTokenAmount[] calldata requiredOutputs
    ) external payable returns (AbsoluteTokenAmount[] memory) {
        return execute(actions, inputs, fee, requiredOutputs, msg.sender);
    }

    /**
     * @dev Executes actions and returns tokens to account.
     * @param actions Array of actions to be executed.
     * @param inputs Array of tokens to be taken from the account address.
     * @param fee Fee share and beneficiary address.
     * @param requiredOutputs Array of requirements for the returned tokens.
     * @param account Address of the account that will receive the returned tokens.
     * @return Array of AbsoluteTokenAmount structs with the returned tokens.
     */
    function execute(
        Action[] calldata actions,
        Input[] calldata inputs,
        Fee calldata fee,
        AbsoluteTokenAmount[] calldata absoluteOutputs,
        SwapType swapType,
        address payable core,
        bytes calldata callData,
        address account
    ) internal returns (AbsoluteTokenAmount[] memory) {
        AbsoluteTokenAmount[] memory absoluteInputs = getAbsoluteTokenAmounts(inputs);

        AbsoluteTokenAmount[] memory initialInputBalances = getBalances(absoluteInputs);
        AbsoluteTokenAmount[] memory initialOutputBalances = getBalances(absoluteOutputs);

        // Transfer tokens to core contract, handle fees (if any), and add these tokens to outputs
        transferTokens(
            calculateInputs(absoluteInputs, absoluteOutputs, swapType, core),
            fee,
            account,
            core
        );

        callCore(core, callData);

        // Emit event so one could track account and fees of this tx.
        emit Executed(account, fee.share, fee.beneficiary); // swapType, core

        AbsoluteTokenAmount[] memory finalInputBalances = getBalances(absoluteInputs);
        AbsoluteTokenAmount[] memory finalOutputBalances = getBalances(outputs);

        compareBalances(absoluteInputs, finalInputBalances, initialInputBalances);
        compareBalances(absoluteOutputs, initialOutputBalances, finalOutputBalances);

        // Return tokens' addresses and amounts that were returned to the account address
        return absoluteOutputs;
    }

    /**
     * @dev Transfers tokens from account address to the core_ contract
     * and takes fees if needed.
     * @param inputs Array of tokens to be taken from the account address.
     * @param fee Fee share and beneficiary address.
     * @param account Address of the account tokens will be transferred from.
     */
    function transferTokens(
        Input[] calldata inputs,
        Fee calldata fee,
        address account
    ) internal {
        if (fee.share > 0) {
            require(fee.beneficiary != address(0), "R: bad beneficiary");
            require(fee.share <= FEE_LIMIT, "R: bad fee");
        }

        uint256 length = inputs.length;
        for (uint256 i = 0; i < length; i++) {
            // ignore output amount as we don't need it
            handleTokenInput(account, core_, inputs[i], fee);
        }

        if (msg.value > 0) {
            // ignore output amount as we don't need it
            handleETHInput(account, core_, fee);
        }
    }

    function callCore(address payable core, bytes calldata callData) internal {
        // Call core contract with all provided ETH, actions, expected outputs and account address
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = core.call(callData);

        // assembly revert opcode is used here as `returnData`
        // is already bytes array generated by the callee's revert()
        // solhint-disable-next-line no-inline-assembly
        assembly {
            if eq(success, 0) {
                revert(add(returnData, 32), returndatasize())
            }
        }
    }
}
