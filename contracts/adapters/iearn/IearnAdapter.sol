pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @title Adapter for iearn.finance protocol.
 * @dev Implementation of Adapter interface.
 */
contract IearnAdapter is Adapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "iearn.finance",
            description: "Decentralized lending protocol",
            protocolType: "Asset",
            tokenType: "YToken",
            iconURL: "protocol-icons.s3.amazonaws.com/iearn.finance.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of YTokens held by the given user.
     * @dev Implementation of Adapter function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        return ERC20(token).balanceOf(user);
    }
}
