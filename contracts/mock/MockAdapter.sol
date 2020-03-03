pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { ProtocolInfo, Token } from "../Structs.sol";
import "../adapters/Adapter.sol";


contract MockAdapter is Adapter {

    mapping (address => uint256) internal balanceOf;

    constructor() public {
        balanceOf[msg.sender] = 1000;
    }

    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Mock",
            description: "Mock protocol",
            protocolType: "Asset",
            tokenType: "Mock",
            iconURL: "mock.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of ZRX locked on the protocol by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address, address user) external view override returns (uint256) {
        return balanceOf[user];
    }
}
