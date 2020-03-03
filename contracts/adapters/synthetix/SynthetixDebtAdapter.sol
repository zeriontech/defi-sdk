pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";


/**
 * @dev Proxy contract interface.
 * Only the functions required for SynthetixDebtAdapter contract are added.
 * The Proxy contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @dev Synthetix contract interface.
 * Only the functions required for SynthetixDebtAdapter contract are added.
 * The Synthetix contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Synthetix.sol.
 */
interface Synthetix {
    function debtBalanceOf(address, bytes32) external view returns (uint256);
}


/**
 * @title Adapter for Synthetix protocol (debt).
 * @dev Implementation of Adapter interface.
 */
contract SynthetixDebtAdapter is Adapter {

    address internal constant SNX = 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F;

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Synthetix",
            description: "Synthetic assets protocol",
            protocolType: "Debt",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/synthetix.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of debt of the given user for the protocol.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address, address user) external view override returns (uint256) {
        Synthetix synthetix = Synthetix(Proxy(SNX).target());

        return synthetix.debtBalanceOf(user, "sUSD");
    }
}
