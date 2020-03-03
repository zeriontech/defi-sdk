pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";


/**
 * @dev Proxy contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The Proxy contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @dev Synthetix contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The Synthetix contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Synthetix.sol.
 */
interface Synthetix {
    function balanceOf(address) external view returns (uint256);
    function transferableSynthetix(address) external view returns (uint256);
}


/**
 * @title Adapter for Synthetix protocol (asset).
 * @dev Implementation of Adapter interface.
 */
contract SynthetixDepositAdapter is Adapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Synthetix",
            description: "Synthetic assets protocol",
            protocolType: "Lock",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/synthetix.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of SNX locked on the protocol by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        Synthetix synthetix = Synthetix(Proxy(token).target());

        return synthetix.balanceOf(user) - synthetix.transferableSynthetix(user);
    }
}
