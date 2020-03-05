pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getToken(address) external view returns (address);
}


/**
 * @title Adapter for Uniswap protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract UniswapAdapter is ProtocolAdapter {

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
        return "Uniswap pool token";
    }

    /**
     * @return Amount of Uniswap pool tokens held by the given account.
     * @param token Address of the exchange (pool)!
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        return ERC20(token).balanceOf(account);
    }
}
