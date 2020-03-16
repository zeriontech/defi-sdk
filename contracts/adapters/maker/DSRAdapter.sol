pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { MKRAdapter } from "./MKRAdapter.sol";


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
 * @dev Implementation of ProtocolAdapter interface.
 */
contract DSRAdapter is ProtocolAdapter, MKRAdapter {

    /**
     * @return Type of the adapter.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function adapterType() external pure override returns (string memory) {
        return "Asset";
    }

    /**
     * @return Type of the token used in adapter.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function tokenType() external pure override returns (string memory) {
        return "ERC20";
    }

    /**
     * @return Amount of DAI locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     * This function repeats the calculations made in drip() function of Pot contract.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        Pot pot = Pot(POT);
        // solhint-disable-next-line not-rely-on-time
        uint256 chi = mkrRmul(mkrRpow(pot.dsr(), now - pot.rho(), ONE), pot.chi());

        return mkrRmul(chi, pot.pie(account));
    }
}
