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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { TransactionData, Action, Input, Output } from "./Structs.sol";


contract SignatureVerifier {
    mapping (address => uint256) public nonces;

    bytes32 public immutable domainSeparator = keccak256(
        abi.encode(
            DOMAIN_SEPARATOR_TYPEHASH,
            address(this)
        )
    );

    // 0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f
    bytes32 public constant DOMAIN_SEPARATOR_TYPEHASH = keccak256(
        abi.encodePacked(
            "EIP712Domain(",
            "address verifyingContract",
            ")"
        )
    );

    bytes32 public constant TX_DATA_TYPEHASH = keccak256(
        abi.encodePacked(
            "TransactionData(Action[] actions,Input[] inputs,Output[] outputs,uint256 nonce)",
            ACTION_ENCODED_TYPE,
            INPUT_ENCODED_TYPE,
            OUTPUT_ENCODED_TYPE
        )
    );

    bytes32 public constant ACTION_TYPEHASH = keccak256(abi.encodePacked(ACTION_ENCODED_TYPE));
    string internal constant ACTION_ENCODED_TYPE = string(
        abi.encodePacked(
            "Action(",
            "uint8 actionType,",
            "bytes32 protocolName,",
            "uint256 adapterIndex,",
            "address[] tokens,",
            "uint256[] amounts,",
            "uint8[] amountTypes,",
            "bytes data",
            ")"
        )
    );

    bytes32 public constant INPUT_TYPEHASH = keccak256(abi.encodePacked(INPUT_ENCODED_TYPE));
    string internal constant INPUT_ENCODED_TYPE = string(
        abi.encodePacked(
            "Input(",
            "address token,",
            "uint256 amount,",
            "uint8 amountType,",
            "uint256 fee,",
            "address beneficiary",
            ")"
        )
    );

    bytes32 public constant OUTPUT_TYPEHASH = keccak256(abi.encodePacked(OUTPUT_ENCODED_TYPE));
    string internal constant OUTPUT_ENCODED_TYPE = string(
        abi.encodePacked(
            "Output(",
            "address token,",
            "uint256 amount",
            ")"
        )
    );

    /// @return Hash to be signed by tokens supplier.
    function hashTransactionData(
        TransactionData memory data
    )
        internal
        view
        returns (bytes32)
    {
        bytes32 transactionDataHash = keccak256(
            abi.encode(
                TX_DATA_TYPEHASH,
                hashActions(data.actions),
                hashInputs(data.inputs),
                hashOutputs(data.outputs),
                data.nonce
            )
        );

        return keccak256(
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator,
                transactionDataHash
            )
        );
    }

    function hashActions(
        Action[] memory actions
    )
        internal
        view
        returns (bytes32)
    {
        bytes memory actionsData = new bytes(0);
        for (uint256 i = 0; i < actions.length; i++) {
            actionsData = abi.encode(actionsData, hashAction(actions[i]));
        }

        return keccak256(actionsData);
    }

    function hashAction(
        Action memory action
    )
        internal
        view
        returns (bytes32)
    {
        bytes32 actionHash = keccak256(
            abi.encode(
                ACTION_TYPEHASH,
                action.actionType,
                action.protocolName,
                action.adapterIndex,
                keccak256(abi.encodePacked(action.tokens)),
                keccak256(abi.encodePacked(action.amounts)),
                keccak256(abi.encodePacked(action.amountTypes)),
                keccak256(action.data)
            )
        );

        return keccak256(
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator,
                actionHash
            )
        );
    }

    function hashInputs(
        Input[] memory inputs
    )
        internal
        view
        returns (bytes32)
    {
        bytes memory inputsData = new bytes(0);
        for (uint256 i = 0; i < inputs.length; i++) {
            inputsData = abi.encode(inputsData, hashInput(inputs[i]));
        }

        return keccak256(inputsData);
    }

    function hashInput(
        Input memory input
    )
        internal
        view
        returns (bytes32)
    {
        bytes32 inputHash = keccak256(
            abi.encode(
                INPUT_TYPEHASH,
                input.token,
                input.amount,
                input.amountType,
                input.fee,
                input.beneficiary
            )
        );

        return keccak256(
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator,
                inputHash
            )
        );
    }

    function hashOutputs(
        Output[] memory outputs
    )
        internal
        view
        returns (bytes32)
    {
        bytes memory outputsData = new bytes(0);
        for (uint256 i = 0; i < outputs.length; i++) {
            outputsData = abi.encode(outputsData, hashOutput(outputs[i]));
        }

        return keccak256(outputsData);
    }

    function hashOutput(
        Output memory output
    )
        internal
        view
        returns (bytes32)
    {
        bytes32 outputHash = keccak256(
            abi.encode(
                OUTPUT_TYPEHASH,
                output.token,
                output.amount
            )
        );

        return keccak256(
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator,
                outputHash
            )
        );
    }

    function getAccountFromSignature(
        TransactionData memory data,
        bytes memory signature
    )
        internal
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
            hashTransactionData(data),
            v,
            r,
            s
        );

        require(nonces[signer] == data.nonce, "SV: wrong nonce!");

        nonces[signer]++;

        return payable(signer);
    }
}
