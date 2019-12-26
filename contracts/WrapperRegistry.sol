pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import { ProtocolWrapper } from "./ProtocolWrapper.sol";
import { ProtocolBalance, AssetBalance } from "./Structs.sol";

/**
 * @title Registry for protocol wrappers.
 * @notice balance(address) function implements the main functionality.
 */
contract WrapperRegistry {

    modifier onlyOwner {
        require(msg.sender == owner, "WR: onlyOwner function!");
        _;
    }

    address public owner;
    ProtocolWrapper[] internal protocolWrappers;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    /**
     * @param _protocolWrappers Array with protocol wrappers supported by the registry.
     */
    constructor(ProtocolWrapper[] memory _protocolWrappers) public {
        require(_protocolWrappers.length != 0, "WR: empty _protocolWrappers array!");

        owner = msg.sender;
        protocolWrappers = _protocolWrappers;
    }

    /**
     * @notice Adds new protocol wrapper to protocolWrappers array.
     * The function is callable only by the owner.
     */
    function addProtocolWrapper(ProtocolWrapper protocolWrapper) external onlyOwner {
        protocolWrappers.push(protocolWrapper);
    }

    /**
     * @notice Removes one of the protocol wrappers by its index.
     * The function is callable only by the owner.
     */
    function removeProtocolWrapper(uint256 index) external onlyOwner {
        require(index < protocolWrappers.length, "WR: index is too large!");
        protocolWrappers[index] = protocolWrappers[protocolWrappers.length - 1];
        protocolWrappers.pop();
    }

    /**
     * @notice Transfers ownership to the desired address.
     * The function is callable only by the owner.
     */
    function transferOwnership(address _owner) external onlyOwner {
        require(_owner != address(0), "PW: new owner is the zero address");
        emit OwnershipTransferred(owner, _owner);
        owner = _owner;
    }

    /**
     * @notice The function with the main functionality.
     * Returns all the amounts of supported assets locked on the supported protocols by the given user.
     */
    function balance(address user) external view returns(ProtocolBalance[] memory) {
        uint256 length = protocolWrappers.length;
        ProtocolBalance[] memory protocolBalances = new ProtocolBalance[](length);
        for (uint256 i = 0; i < length; i++) {
            protocolBalances[i] = protocolWrappers[i].getProtocolBalance(user);
        }
        return protocolBalances;
    }

    /**
     * @notice Getter function for the protocolWrappers array.
     */
    function getProtocolWrappers() external view returns(ProtocolWrapper[] memory) {
        return protocolWrappers;
    }
}
