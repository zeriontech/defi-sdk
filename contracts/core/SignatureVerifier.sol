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

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import {
    TransactionData,
    Action,
    AbsoluteTokenAmount,
    Fee,
    TokenAmount
} from "../shared/Structs.sol";
import { ECDSA } from "../shared/ECDSA.sol";

contract SignatureVerifier {
    mapping(bytes32 => mapping(address => bool)) internal isHashUsed_;

    bytes32 internal immutable nameHash_;

    bytes32 internal constant DOMAIN_SEPARATOR_TYPEHASH =
        keccak256(
            abi.encodePacked(
                "EIP712Domain(",
                "string name,",
                "uint256 chainId,",
                "address verifyingContract",
                ")"
            )
        );
    bytes32 internal constant TX_DATA_TYPEHASH =
        keccak256(
            abi.encodePacked(
                TX_DATA_ENCODED_TYPE,
                ABSOLUTE_TOKEN_AMOUNT_ENCODED_TYPE,
                ACTION_ENCODED_TYPE,
                FEE_ENCODED_TYPE,
                TOKEN_AMOUNT_ENCODED_TYPE
            )
        );
    bytes32 internal constant ABSOLUTE_TOKEN_AMOUNT_TYPEHASH =
        keccak256(ABSOLUTE_TOKEN_AMOUNT_ENCODED_TYPE);
    bytes32 internal constant ACTION_TYPEHASH =
        keccak256(abi.encodePacked(ACTION_ENCODED_TYPE, TOKEN_AMOUNT_ENCODED_TYPE));
    bytes32 internal constant FEE_TYPEHASH = keccak256(FEE_ENCODED_TYPE);
    bytes32 internal constant TOKEN_AMOUNT_TYPEHASH = keccak256(TOKEN_AMOUNT_ENCODED_TYPE);

    bytes internal constant TX_DATA_ENCODED_TYPE =
        abi.encodePacked(
            "TransactionData(",
            "Action[] actions,",
            "TokenAmount[] inputs,",
            "Fee fee,",
            "AbsoluteTokenAmount[] requiredOutputs,",
            "address account,",
            "uint256 salt",
            ")"
        );
    bytes internal constant ABSOLUTE_TOKEN_AMOUNT_ENCODED_TYPE =
        abi.encodePacked("AbsoluteTokenAmount(", "address token,", "uint256 amount", ")");
    bytes internal constant ACTION_ENCODED_TYPE =
        abi.encodePacked(
            "Action(",
            "bytes32 protocolAdapterName,",
            "uint8 actionType,",
            "TokenAmount[] tokenAmounts,",
            "bytes data",
            ")"
        );
    bytes internal constant FEE_ENCODED_TYPE =
        abi.encodePacked("Fee(", "uint256 share,", "address beneficiary", ")");
    bytes internal constant TOKEN_AMOUNT_ENCODED_TYPE =
        abi.encodePacked(
            "TokenAmount(",
            "address token,",
            "uint256 amount,",
            "uint8 amountType",
            ")"
        );

    constructor(string memory name) {
        nameHash_ = keccak256(abi.encodePacked(name));
    }

    /**
     * @param hash Hash to be checked.
     * @param account Address of the hash will be checked for.
     * @return True if hash has already been used by this account address.
     */
    function isHashUsed(bytes32 hash, address account) public view returns (bool) {
        return isHashUsed_[hash][account];
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
     * @param data TransactionData struct to be hashed.
     * @return TransactionData struct hashed with domainSeparator.
     */
    function hashData(TransactionData memory data) public view returns (bytes32) {
        bytes32 domainSeparator =
            keccak256(
                abi.encode(DOMAIN_SEPARATOR_TYPEHASH, nameHash_, getChainId(), address(this))
            );

        return
            keccak256(abi.encodePacked(bytes1(0x19), bytes1(0x01), domainSeparator, hash(data)));
    }

    /**
     * @dev Marks hash as used by the given account.
     * @param hash Hash to be marked is used.
     * @param account Account using the hash.
     */
    function markHashUsed(bytes32 hash, address account) internal {
        require(!isHashUsed_[hash][account], "SV: used hash!");
        isHashUsed_[hash][account] = true;
    }

    /**
     * @param data TransactionData struct to be hashed.
     * @return Hashed TransactionData struct.
     */
    function hash(TransactionData memory data) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    TX_DATA_TYPEHASH,
                    hash(data.actions),
                    hash(data.inputs),
                    hash(data.fee),
                    hash(data.requiredOutputs),
                    data.account,
                    data.salt
                )
            );
    }

    /**
     * @dev Hashes Action structs list.
     * @param actions Action structs list to be hashed.
     * @return Hashed Action structs list.
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
     * @dev Hashes TokenAmount structs list.
     * @param tokenAmounts TokenAmount structs list to be hashed.
     * @return Hashed TokenAmount structs list.
     */
    function hash(TokenAmount[] memory tokenAmounts) internal pure returns (bytes32) {
        bytes memory tokenAmountsData = new bytes(0);

        uint256 length = tokenAmounts.length;
        for (uint256 i = 0; i < length; i++) {
            tokenAmountsData = abi.encodePacked(
                tokenAmountsData,
                keccak256(
                    abi.encode(
                        TOKEN_AMOUNT_TYPEHASH,
                        tokenAmounts[i].token,
                        tokenAmounts[i].amount,
                        tokenAmounts[i].amountType
                    )
                )
            );
        }

        return keccak256(tokenAmountsData);
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
     * @dev Hashes AbsoluteTokenAmount structs list.
     * @param absoluteTokenAmounts AbsoluteTokenAmount structs list to be hashed.
     * @return Hashed AbsoluteTokenAmount structs list.
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
                        absoluteTokenAmounts[i].amount
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

        assembly {
            chainId := chainid()
        }

        return chainId;
    }
}
