pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";


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
 * @title Asset adapter for Synthetix protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract SynthetixAssetAdapter is ProtocolAdapter {

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
     * @return Amount of SNX locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        Synthetix synthetix = Synthetix(Proxy(token).target());

        return synthetix.balanceOf(account) - synthetix.transferableSynthetix(account);
    }
}
