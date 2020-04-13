pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { Approval } from "./Structs.sol";


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

    bytes32 public constant APPROVAL_TYPEHASH = keccak256(
        abi.encodePacked(
            "Approval(",
            "address token,",
            "uint256 amount,",
            "uint8 amountType,",
            "uint256 nonce",
            ")"
        )
    );

    /// @return Hash to be signed by assets supplier.
    function hashApproval(
        Approval memory approval
    )
        public
        view
        returns (bytes32)
    {
        bytes32 approvalHash = keccak256(
            abi.encode(
                APPROVAL_TYPEHASH,
                approval.token,
                approval.amount,
                approval.amountType,
                approval.nonce
            )
        );

        return keccak256(
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator,
                approvalHash
            )
        );
    }

    function getUserFromSignatures(
        Approval[] memory approvals,
        bytes[] memory signatures
    )
        internal
        returns (address payable)
    {
        address initialSigner = getUserFromSignature(approvals[0], signatures[0]);
        require(nonces[initialSigner] == approvals[0].nonce, "SV: wrong nonce!");

        address signer;
        for (uint256 i = 1; i < approvals.length; i++) {
            signer = getUserFromSignature(approvals[i], signatures[i]);
            require(initialSigner == signer, "SV: wrong sig!");
            require(nonces[signer] == approvals[i].nonce, "SV: wrong nonce!");
        }

        nonces[initialSigner]++;
        return payable(initialSigner);
    }

    function getUserFromSignature(
        Approval memory approval,
        bytes memory signature
    )
        internal
        view
        returns (address)
    {
        require(signature.length == 65, "SV: wrong sig length!");
        bytes32 r;
        bytes32 s;
        uint8 v;

        // solhint-disable-next-line no-inline-assembly
        // solium-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        return ecrecover(
            hashApproval(approval),
            v,
            r,
            s
        );
    }
}
