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
    Action,
    Input,
    TokenAmount,
    Permit,
    AbsoluteTokenAmount,
    Fee
} from "../shared/Structs.sol";
import { ECDSA } from "../shared/ECDSA.sol";

contract SignatureVerifier {
    mapping(bytes32 => mapping(address => bool)) internal isHashUsed_;

    bytes32 internal immutable nameHash_;

    bytes32 internal constant DOMAIN_SEPARATOR_TYPEHASH =
        keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 internal constant EXECUTE_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "Execute(",
                "Action[] actions,",
                "Input[] inputs,",
                "Fee fee,",
                "AbsoluteTokenAmount[] requiredOutputs,",
                "address account,",
                "uint256 salt",
                ")",
                "AbsoluteTokenAmount(address token,uint256 absoluteAmount)",
                "Action(",
                "bytes32 protocolAdapterName,",
                "uint8 actionType,",
                "TokenAmount[] tokenAmounts,",
                "bytes data",
                ")",
                "Fee(uint256 share,address beneficiary)",
                "Input(TokenAmount tokenAmount,Permit permit)",
                "Permit(uint8 permitType,bytes permitCallData)",
                "TokenAmount(address token,uint256 amount,uint8 amountType)"
            )
        );
    bytes32 internal constant ABSOLUTE_TOKEN_AMOUNT_TYPEHASH =
        keccak256(abi.encodePacked("AbsoluteTokenAmount(address token,uint256 absoluteAmount)"));
    bytes32 internal constant ACTION_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "Action(",
                "bytes32 protocolAdapterName,",
                "uint8 actionType,",
                "TokenAmount[] tokenAmounts,",
                "bytes data)",
                "TokenAmount(address token,uint256 amount,uint8 amountType)"
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

    constructor(string memory name) {
        nameHash_ = keccak256(abi.encodePacked(name));
    }

    /**
     * @param hashToCheck Hash to be checked.
     * @param account Address of the hash will be checked for.
     * @return True if hash has already been used by this account address.
     */
    function isHashUsed(bytes32 hashToCheck, address account) public view returns (bool) {
        return isHashUsed_[hashToCheck][account];
    }

    /**
     * @param hashedData Hash to be checked.
     * @param signature EIP-712 signature.
     * @return Account that signed the hashed data.
     */
    function getAccountFromSignature(bytes32 hashedData, bytes memory signature)
        public
        pure
        returns (address payable)
    {
        return payable(ECDSA.recover(hashedData, signature));
    }

    /**
     * @param actions Action structs array to be hashed.
     * @param inputs Input structs array to be hashed.
     * @param fee Fee struct to be hashed.
     * @param requiredOutputs AbsoluteTokenAmount structs array to be hashed.
     * @param account Account address to be hashed.
     * @param salt Salt parameter preventing double-spending to be hashed.
     * @return Execute data hashed with domainSeparator.
     */
    function hashData(
        Action[] memory actions,
        Input[] memory inputs,
        Fee memory fee,
        AbsoluteTokenAmount[] memory requiredOutputs,
        address account,
        uint256 salt
    ) public view returns (bytes32) {
        bytes32 domainSeparator =
            keccak256(
                abi.encode(DOMAIN_SEPARATOR_TYPEHASH, nameHash_, getChainId(), address(this))
            );

        return
            keccak256(
                abi.encodePacked(
                    bytes1(0x19),
                    bytes1(0x01),
                    domainSeparator,
                    hash(actions, inputs, fee, requiredOutputs, account, salt)
                )
            );
    }

    /**
     * @dev Marks hash as used by the given account.
     * @param hashToMark Hash to be marked as used one.
     * @param account Account using the hash.
     */
    function markHashUsed(bytes32 hashToMark, address account) internal {
        require(!isHashUsed_[hashToMark][account], "SV: used hash!");
        isHashUsed_[hashToMark][account] = true;
    }

    /**
     * @param actions Action structs array to be hashed.
     * @param inputs Input structs array to be hashed.
     * @param fee Fee struct to be hashed.
     * @param requiredOutputs AbsoluteTokenAmount structs array to be hashed.
     * @param account Account address to be hashed.
     * @param salt Salt parameter preventing double-spending to be hashed.
     * @return Execute data hashed.
     */
    function hash(
        Action[] memory actions,
        Input[] memory inputs,
        Fee memory fee,
        AbsoluteTokenAmount[] memory requiredOutputs,
        address account,
        uint256 salt
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EXECUTE_TYPEHASH,
                    hash(actions),
                    hash(inputs),
                    hash(fee),
                    hash(requiredOutputs),
                    account,
                    salt
                )
            );
    }

    /**
     * @param actions Action structs array to be hashed.
     * @return Hashed Action structs array.
     */
    function hash(Action[] memory actions) internal pure returns (bytes32) {
        bytes memory actionsData = new bytes(0);

        uint256 length = actions.length;
        for (uint256 i = 0; i < length; i++) {
            actionsData = abi.encodePacked(
                actionsData,
                keccak256(
                    abi.encode(
                        ACTION_TYPEHASH,
                        actions[i].protocolAdapterName,
                        actions[i].actionType,
                        hash(actions[i].tokenAmounts),
                        keccak256(actions[i].data)
                    )
                )
            );
        }

        return keccak256(actionsData);
    }

    /**
     * @param tokenAmounts TokenAmount structs array to be hashed.
     * @return Hashed TokenAmount structs array.
     */
    function hash(TokenAmount[] memory tokenAmounts) internal pure returns (bytes32) {
        bytes memory tokenAmountsData = new bytes(0);

        uint256 length = tokenAmounts.length;
        for (uint256 i = 0; i < length; i++) {
            tokenAmountsData = abi.encodePacked(tokenAmountsData, hash(tokenAmounts[i]));
        }

        return keccak256(tokenAmountsData);
    }

    /**
     * @param tokenAmount TokenAmount struct to be hashed.
     * @return Hashed TokenAmount struct.
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
     * @param inputs Input structs array to be hashed.
     * @return Hashed Input structs array.
     */
    function hash(Input[] memory inputs) internal pure returns (bytes32) {
        bytes memory inputsData = new bytes(0);

        uint256 length = inputs.length;
        for (uint256 i = 0; i < length; i++) {
            inputsData = abi.encodePacked(
                inputsData,
                keccak256(
                    abi.encode(INPUT_TYPEHASH, hash(inputs[i].tokenAmount), hash(inputs[i].permit))
                )
            );
        }

        return keccak256(inputsData);
    }

    /**
     * @dev Hashes Permit struct.
     * @param permit Permit struct to be hashed.
     * @return Hashed Permit struct.
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
     * @dev Hashes Fee struct.
     * @param fee Fee struct to be hashed.
     * @return Hashed Fee struct.
     */
    function hash(Fee memory fee) internal pure returns (bytes32) {
        return keccak256(abi.encode(FEE_TYPEHASH, fee.share, fee.beneficiary));
    }

    /**
     * @dev Hashes AbsoluteTokenAmount structs array.
     * @param absoluteTokenAmounts AbsoluteTokenAmount structs array to be hashed.
     * @return Hashed AbsoluteTokenAmount structs array.
     */
    function hash(AbsoluteTokenAmount[] memory absoluteTokenAmounts)
        internal
        pure
        returns (bytes32)
    {
        bytes memory absoluteTokenAmountsData = new bytes(0);

        uint256 length = absoluteTokenAmounts.length;
        for (uint256 i = 0; i < length; i++) {
            absoluteTokenAmountsData = abi.encodePacked(
                absoluteTokenAmountsData,
                keccak256(
                    abi.encode(
                        ABSOLUTE_TOKEN_AMOUNT_TYPEHASH,
                        absoluteTokenAmounts[i].token,
                        absoluteTokenAmounts[i].absoluteAmount
                    )
                )
            );
        }

        return keccak256(absoluteTokenAmountsData);
    }

    /**
     * @return Current chain ID.
     */
    function getChainId() internal pure returns (uint256) {
        uint256 chainId;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            chainId := chainid()
        }

        return chainId;
    }
}
