pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @title Adapter for Aave protocol (asset).
 * @dev Implementation of Adapter interface.
 */
contract AaveAssetAdapter is Adapter {

    address internal constant PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Aave",
            description: "Decentralized lending & borrowing protocol",
            protocolType: "Asset",
            tokenType: "AToken",
            iconURL: "protocol-icons.s3.amazonaws.com/aave.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of ATokens held by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        return ERC20(token).balanceOf(user);
    }
}
