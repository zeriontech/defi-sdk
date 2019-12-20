pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import { ProtocolWrapper } from "./ProtocolWrapper.sol";
import { ProtocolBalance, AssetBalance } from "Structs.sol";


contract WrapperRegistry {

    modifier onlyOwner {
        require(msg.sender == owner, "WR: this function is callable only by the owner!");
        _;
    }

    address public owner;
    ProtocolWrapper[] public protocolWrappers;

    constructor(ProtocolWrapper[] memory _protocolWrappers) public {
        require(_protocolWrappers.length != 0, "WR: empty _protocolWrappers array in constructor!");

        owner = msg.sender;
        protocolWrappers = _protocolWrappers;
    }

    function addProtocolWrapper(ProtocolWrapper protocolWrapper) external onlyOwner{
        protocolWrappers.push(protocolWrapper);
    }

    function removeProtocolWrapper(uint256 index) external onlyOwner {
        protocolWrappers[index] = protocolWrappers[protocolWrappers.length - 1];
        protocolWrappers.pop();
    }

    function balance(address user) external view returns(ProtocolBalance[] memory) {
        uint256 length = protocolWrappers.length;
        ProtocolBalance[] memory protocolBalances = new ProtocolBalance[](length);
        for(uint256 i = 0; i < length; i++) {
            protocolBalances[i] = protocolWrappers[i].checkBalance(user);
        }
    }
}
