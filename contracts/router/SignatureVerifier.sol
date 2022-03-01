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

pragma solidity 0.8.12;

import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

import { ISignatureVerifier } from "../interfaces/ISignatureVerifier.sol";
import { UsedHash } from "../shared/Errors.sol";
import {
    AbsoluteTokenAmount,
    AccountSignature,
    ProtocolFeeSignature,
    Fee,
    Input,
    Permit,
    SwapDescription,
    TokenAmount
} from "../shared/Structs.sol";

contract SignatureVerifier is ISignatureVerifier, EIP712 {
    mapping(bytes32 => bool) private isHashUsed_;

    bytes32 internal constant ACCOUNT_SIGNATURE_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "AccountSignature(",
                "Input input,",
                "AbsoluteTokenAmount output,",
                "SwapDescription swapDescription,",
                "uint256 salt",
                ")",
                "AbsoluteTokenAmount(address token,uint256 absoluteAmount)",
                "Fee(uint256 share,address beneficiary)",
                "Input(TokenAmount tokenAmount,Permit permit)",
                "Permit(uint8 permitType,bytes permitCallData)",
                "SwapDescription(",
                "uint8 swapType,",
                "Fee protocolFee,",
                "Fee marketplaceFee,",
                "address account,",
                "address caller,",
                "bytes callerCallData",
                ")",
                "TokenAmount(address token,uint256 amount,uint8 amountType)"
            )
        );
    bytes32 internal constant PROTOCOL_FEE_SIGNATURE_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "ProtocolFeeSignature(",
                "Input input,",
                "AbsoluteTokenAmount output,",
                "SwapDescription swapDescription,",
                "uint256 deadline",
                ")",
                "AbsoluteTokenAmount(address token,uint256 absoluteAmount)",
                "Fee(uint256 share,address beneficiary)",
                "Input(TokenAmount tokenAmount,Permit permit)",
                "Permit(uint8 permitType,bytes permitCallData)",
                "SwapDescription(",
                "uint8 swapType,",
                "Fee protocolFee,",
                "Fee marketplaceFee,",
                "address account,",
                "address caller,",
                "bytes callerCallData",
                ")",
                "TokenAmount(address token,uint256 amount,uint8 amountType)"
            )
        );
    bytes32 internal constant ABSOLUTE_TOKEN_AMOUNT_TYPEHASH =
        keccak256(abi.encodePacked("AbsoluteTokenAmount(address token,uint256 absoluteAmount)"));
    bytes32 internal constant SWAP_DESCRIPTION_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "SwapDescription(",
                "uint8 swapType,",
                "Fee protocolFee,",
                "Fee marketplaceFee,",
                "address account,",
                "address caller,",
                "bytes callerCallData",
                ")",
                "Fee(uint256 share,address beneficiary)"
            )
        );
    bytes32 internal constant FEE_TYPEHASH =
        keccak256(abi.encodePacked("Fee(uint256 share,address beneficiary)"));
    bytes32 internal constant INPUT_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "Input(TokenAmount tokenAmount,Permit permit)",
                "Permit(uint8 permitType,bytes permitCallData)",
                "TokenAmount(address token,uint256 amount,uint8 amountType)"
            )
        );
    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256(abi.encodePacked("Permit(uint8 permitType,bytes permitCallData)"));
    bytes32 internal constant TOKEN_AMOUNT_TYPEHASH =
        keccak256(abi.encodePacked("TokenAmount(address token,uint256 amount,uint8 amountType)"));

    /**
     * @param name String with EIP712 name.
     * @param version String with EIP712 version.
     */
    constructor(string memory name, string memory version) EIP712(name, version) {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @inheritdoc ISignatureVerifier
     */
    function isHashUsed(bytes32 hashToCheck) external view override returns (bool hashUsed) {
        return isHashUsed_[hashToCheck];
    }

    /**
     * @inheritdoc ISignatureVerifier
     */
    function hashAccountSignatureData(
        Input memory input,
        AbsoluteTokenAmount memory output,
        SwapDescription memory swapDescription,
        uint256 salt
    ) public view override returns (bytes32 hashedData) {
        return
            _hashTypedDataV4(
                hash(ACCOUNT_SIGNATURE_TYPEHASH, input, output, swapDescription, salt)
            );
    }

    /**
     * @inheritdoc ISignatureVerifier
     */
    function hashProtocolFeeSignatureData(
        Input memory input,
        AbsoluteTokenAmount memory output,
        SwapDescription memory swapDescription,
        uint256 deadline
    ) public view override returns (bytes32 hashedData) {
        return
            _hashTypedDataV4(
                hash(PROTOCOL_FEE_SIGNATURE_TYPEHASH, input, output, swapDescription, deadline)
            );
    }

    /**
     * @dev Marks hash as used by the given account.
     * @param hashToMark Hash to be marked as used one.
     */
    function markHashUsed(bytes32 hashToMark) internal {
        if (isHashUsed_[hashToMark]) revert UsedHash(hashToMark);

        isHashUsed_[hashToMark] = true;
    }

    /**
     * @param typehash The required signature typehash
     * @param input Input described in `hashDada()` function
     * @param output Outut described in `hashDada()` function
     * @param swapDescription Swap parameters described in `hashDada()` function
     * @param saltOrDeadline Salt/deadline parameter preventing double-spending
     * @return `execute()` function data hashed
     */
    function hash(
        bytes32 typehash,
        Input memory input,
        AbsoluteTokenAmount memory output,
        SwapDescription memory swapDescription,
        uint256 saltOrDeadline
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    typehash,
                    hash(input),
                    hash(output),
                    hash(swapDescription),
                    saltOrDeadline
                )
            );
    }

    /**
     * @param input Input struct to be hashed
     * @return Hashed Input structs array
     */
    function hash(Input memory input) internal pure returns (bytes32) {
        return keccak256(abi.encode(INPUT_TYPEHASH, hash(input.tokenAmount), hash(input.permit)));
    }

    /**
     * @param tokenAmount TokenAmount struct to be hashed
     * @return Hashed TokenAmount struct
     */
    function hash(TokenAmount memory tokenAmount) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    TOKEN_AMOUNT_TYPEHASH,
                    tokenAmount.token,
                    tokenAmount.amount,
                    tokenAmount.amountType
                )
            );
    }

    /**
     * @param permit Permit struct to be hashed
     * @return Hashed Permit struct
     */
    function hash(Permit memory permit) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PERMIT_TYPEHASH,
                    permit.permitType,
                    keccak256(abi.encodePacked(permit.permitCallData))
                )
            );
    }

    /**
     * @param absoluteTokenAmount AbsoluteTokenAmount struct to be hashed
     * @return Hashed AbsoluteTokenAmount struct
     */
    function hash(AbsoluteTokenAmount memory absoluteTokenAmount) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    ABSOLUTE_TOKEN_AMOUNT_TYPEHASH,
                    absoluteTokenAmount.token,
                    absoluteTokenAmount.absoluteAmount
                )
            );
    }

    /**
     * @param swapDescription SwapDescription struct to be hashed
     * @return Hashed SwapDescription struct
     */
    function hash(SwapDescription memory swapDescription) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    SWAP_DESCRIPTION_TYPEHASH,
                    swapDescription.swapType,
                    hash(swapDescription.protocolFee),
                    hash(swapDescription.marketplaceFee),
                    swapDescription.account,
                    swapDescription.caller,
                    keccak256(abi.encodePacked(swapDescription.callerCallData))
                )
            );
    }

    /**
     * @param fee Fee struct to be hashed
     * @return Hashed Fee struct
     */
    function hash(Fee memory fee) internal pure returns (bytes32) {
        return keccak256(abi.encode(FEE_TYPEHASH, fee.share, fee.beneficiary));
    }
}
