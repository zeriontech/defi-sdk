pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev Staking contract interface.
 * Only the functions required for ZrxAdapter contract are added.
 * The Staking contract is available here
 * github.com/0xProject/0x-monorepo/blob/development/contracts/staking/contracts/src/Staking.sol.
 */
interface Staking {
    function getTotalStake(address) external view returns (uint256);
}


/**
 * @title Adapter for 0x protocol.
 * @dev Implementation of Adapter interface.
 */
contract ZrxAdapter is Adapter {

    address internal constant STAKING = 0xa26e80e7Dea86279c6d778D702Cc413E6CFfA777;

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "0x Staking",
            description: "Liquidity rewards with ZRX",
            protocolType: "Asset",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/0x-staking.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of ZRX locked on the protocol by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address, address user) external view override returns (uint256) {
        return Staking(STAKING).getTotalStake(user);
    }
}
