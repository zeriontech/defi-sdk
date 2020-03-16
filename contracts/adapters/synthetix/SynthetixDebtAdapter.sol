pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";


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
 * @title Debt adapter for Synthetix protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract SynthetixDebtAdapter is ProtocolAdapter {

    address internal constant SNX = 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F;

    /**
     * @return Type of the adapter.
     */
    function adapterType() external pure override returns (string memory) {
        return "Debt";
    }

    /**
     * @return Type of the token used in adapter.
     */
    function tokenType() external pure override returns (string memory) {
        return "ERC20";
    }

    /**
     * @return Amount of debt of the given account for the protocol.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        Synthetix synthetix = Synthetix(Proxy(SNX).target());

        return synthetix.debtBalanceOf(account, "sUSD");
    }
}
