pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @title Adapter for Compound protocol (asset).
 * @dev Implementation of Adapter interface.
 */
contract CompoundAssetAdapter is Adapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Compound",
            description: "",
            protocolType: "Asset",
            tokenType: "CToken",
            iconURL: "protocol-icons.s3.amazonaws.com/compound.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of CTokens held by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        return ERC20(token).balanceOf(user);
    }
}
