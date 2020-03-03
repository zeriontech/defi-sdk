pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { CompoundRegistry } from "./CompoundRegistry.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundBorrowAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function borrowBalanceStored(address) external view returns (uint256);
}


/**
 * @title Adapter for Compound protocol (debt).
 * @dev Implementation of Adapter interface.
 */
contract CompoundDebtAdapter is Adapter {

    address internal constant REGISTRY = 0xE6881a7d699d3A350Ce5bba0dbD59a9C36778Cb7;

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Compound",
            description: "",
            protocolType: "Debt",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/compound.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of debt of the given user for the protocol.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        CToken cToken = CToken(CompoundRegistry(REGISTRY).getCToken(token));

        return cToken.borrowBalanceStored(user);
    }
}
