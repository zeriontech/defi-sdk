pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev BasePool contract interface.
 * Only the functions required for PoolTogetherAdapter contract are added.
 * The BasePool contract is available here
 * github.com/pooltogether/pooltogether-contracts/blob/master/contracts/BasePool.sol.
 */
interface BasePool {
    function totalBalanceOf(address) external view returns (uint256);
    function token() external view returns (address);
}


/**
 * @title Adapter for PoolTogether protocol.
 * @dev Implementation of Adapter interface.
 */
contract PoolTogetherAdapter is Adapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "PoolTogether",
            description: "Decentralized no-loss lottery",
            protocolType: "Asset",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/pooltogether.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of tokens locked in the pool by the given user.
     * @param token Address of the pool!
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        return BasePool(token).totalBalanceOf(user);
    }
}
