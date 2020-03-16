pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../adapters/ProtocolAdapter.sol";


contract MockAdapter is ProtocolAdapter {

    mapping (address => uint256) internal balanceOf;

    constructor() public {
        balanceOf[msg.sender] = 1000;
    }

    /**
     * @return Type of the adapter.
     */
    function adapterType() external pure override returns (string memory) {
        return "Asset";
    }

    /**
     * @return Type of the token used in adapter.
     */
    function tokenType() external pure override returns (string memory) {
        return "ERC20";
    }

    /**
     * @return Mock balance.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        return balanceOf[account];
    }
}
