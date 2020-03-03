pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { MKRAdapter } from "./MKRAdapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";


/**
 * @dev Pot contract interface.
 * Only the functions required for DSRAdapter contract are added.
 * The Pot contract is available here
 * github.com/makerdao/dss/blob/master/src/pot.sol.
 */
interface Pot {
    function pie(address) external view returns (uint256);
    function dsr() external view returns (uint256);
    function rho() external view returns (uint256);
    function chi() external view returns (uint256);
}


/**
 * @title Adapter for DSR protocol.
 * @dev Implementation of Adapter interface.
 */
contract DSRAdapter is Adapter, MKRAdapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Dai Savings Rate",
            description: "Decentralized lending protocol",
            protocolType: "Asset",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/dai.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of DAI locked on the protocol by the given user.
     * @dev Implementation of Adapter interface function.
     * This function repeats the calculations made in drip() function of Pot contract.
     */
    function getBalance(address, address user) external view override returns (uint256) {
        Pot pot = Pot(POT);
        // solhint-disable-next-line not-rely-on-time
        uint256 chi = mkrRmul(mkrRpow(pot.dsr(), now - pot.rho(), ONE), pot.chi());

        return mkrRmul(chi, pot.pie(user));
    }
}
