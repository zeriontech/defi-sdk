pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapLiquidityAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getToken(address) external view returns (address);
}


/**
 * @title Adapter for Uniswap protocol.
 * @dev Implementation of Adapter interface.
 */
contract UniswapLiquidityAdapter is Adapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Uniswap Liquidity",
            description: "Exchange liquidity pool for tokens trading",
            protocolType: "Asset",
            tokenType: "UNIToken",
            iconURL: "protocol-icons.s3.amazonaws.com/uniswap.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of Uniswap pool tokens held by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        return ERC20(token).balanceOf(user);
    }
}
