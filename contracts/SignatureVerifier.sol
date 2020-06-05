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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { TransactionData, Action, Input, Output } from "./Structs.sol";


contract SignatureVerifier {
    mapping (address => uint256) public nonces;

    bytes32 internal immutable domainSeparator;

    bytes32 internal constant DOMAIN_SEPARATOR_TYPEHASH = keccak256(
        abi.encodePacked(
            "EIP712Domain(",
            "string name,",
            "address verifyingContract",
            ")"
        )
    );
    bytes32 internal constant TX_DATA_TYPEHASH = keccak256(
        abi.encodePacked(
            TX_DATA_ENCODED_TYPE,
            ACTION_ENCODED_TYPE,
            INPUT_ENCODED_TYPE,
            OUTPUT_ENCODED_TYPE
        )
    );
    bytes32 internal constant ACTION_TYPEHASH = keccak256(ACTION_ENCODED_TYPE);
    bytes32 internal constant INPUT_TYPEHASH = keccak256(INPUT_ENCODED_TYPE);
    bytes32 internal constant OUTPUT_TYPEHASH = keccak256(OUTPUT_ENCODED_TYPE);

    bytes internal constant TX_DATA_ENCODED_TYPE = abi.encodePacked(
        "TransactionData(",
        "Action[] actions,",
        "Input[] inputs,",
        "Output[] outputs,",
        "uint256 nonce",
        ")"
    );
    bytes internal constant ACTION_ENCODED_TYPE = abi.encodePacked(
        "Action(",
        "uint8 actionType,",
        "bytes32 protocolName,",
        "uint256 adapterIndex,",
        "address[] tokens,",
        "uint256[] amounts,",
        "uint8[] amountTypes,",
        "bytes data",
        ")"
    );
    bytes internal constant INPUT_ENCODED_TYPE = abi.encodePacked(
        "Input(",
        "address token,",
        "uint256 amount,",
        "uint8 amountType,",
        "uint256 fee,",
        "address beneficiary",
        ")"
    );
    bytes internal constant OUTPUT_ENCODED_TYPE = abi.encodePacked(
        "Output(",
        "address token,",
        "uint256 amount",
        ")"
    );

    constructor(string memory name) public {
        domainSeparator = keccak256(
            abi.encode(
                DOMAIN_SEPARATOR_TYPEHASH,
                keccak256(abi.encodePacked(name)),
                address(this)
            )
        );
    }

    function getAccountFromSignature(
        TransactionData memory data,
        bytes memory signature
    )
        public
        returns (address payable)
    {
        require(signature.length == 65, "SV: wrong sig length!");
        bytes32 r;
        bytes32 s;
        uint8 v;

        // solium-disable-next-line no-inline-assembly
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        address signer = ecrecover(
            keccak256(
                abi.encodePacked(
                    bytes1(0x19),
                    bytes1(0x01),
                    domainSeparator,
                    hash(data)
                )
            ),
            v,
            r,
            s
        );

        require(nonces[signer] == data.nonce, "SV: wrong nonce!");

        nonces[signer]++;

        return payable(signer);
    }

    /// @return Hash to be signed by tokens supplier.
    function hash(
        TransactionData memory data
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encode(
                TX_DATA_TYPEHASH,
                hash(data.actions),
                hash(data.inputs),
                hash(data.outputs),
                data.nonce
            )
        );
    }

    function hash(
        Action[] memory actions
    )
        internal
        pure
        returns (bytes32)
    {
        bytes memory actionsData = new bytes(0);
        for (uint256 i = 0; i < actions.length; i++) {
            actionsData = abi.encodePacked(
                actionsData,
                keccak256(
                    abi.encode(
                        ACTION_TYPEHASH,
                        actions[i].actionType,
                        actions[i].protocolName,
                        actions[i].adapterIndex,
                        keccak256(abi.encodePacked(actions[i].tokens)),
                        keccak256(abi.encodePacked(actions[i].amounts)),
                        keccak256(abi.encodePacked(actions[i].amountTypes)),
                        keccak256(actions[i].data)
                    )
                )
            );
        }

        return keccak256(actionsData);
    }

    function hash(
        Input[] memory inputs
    )
        internal
        pure
        returns (bytes32)
    {
        bytes memory inputsData = new bytes(0);
        for (uint256 i = 0; i < inputs.length; i++) {
            inputsData = abi.encodePacked(
                inputsData,
                keccak256(
                    abi.encode(
                        INPUT_TYPEHASH,
                        inputs[i].token,
                        inputs[i].amount,
                        inputs[i].amountType,
                        inputs[i].fee,
                        inputs[i].beneficiary
                    )
                )
            );
        }

        return keccak256(inputsData);
    }

    function hash(
        Output[] memory outputs
    )
        internal
        pure
        returns (bytes32)
    {
        bytes memory outputsData = new bytes(0);
        for (uint256 i = 0; i < outputs.length; i++) {
            outputsData = abi.encodePacked(
                outputsData,
                keccak256(
                    abi.encode(
                        OUTPUT_TYPEHASH,
                        outputs[i].token,
                        outputs[i].amount
                    )
                )
            );
        }

        return keccak256(outputsData);
    }
}
