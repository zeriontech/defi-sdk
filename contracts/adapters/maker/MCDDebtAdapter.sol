pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { MKRAdapter } from "./MKRAdapter.sol";


/**
 * @dev Vat contract interface.
 * Only the functions required for MCDDebtAdapter contract are added.
 * The Vat contract is available here
 * github.com/makerdao/dss/blob/master/src/vat.sol.
 */
interface Vat {
    function urns(bytes32, address) external view returns (uint256, uint256);
    function ilks(bytes32) external view returns (uint256, uint256);
}


/**
 * @dev Jug contract interface.
 * Only the functions required for MCDDebtAdapter contract are added.
 * The Jug contract is available here
 * github.com/makerdao/dss/blob/master/src/jug.sol.
 */
interface Jug {
    function ilks(bytes32) external view returns (uint256, uint256);
    function base() external view returns (uint256);
}


/**
 * @dev DssCdpManager contract interface.
 * Only the functions required for MCDDebtAdapter contract are added.
 * The DssCdpManager contract is available here
 * github.com/makerdao/dss-cdp-manager/blob/master/src/DssCdpManager.sol.
 */
interface DssCdpManager {
    function first(address) external view returns (uint256);
    function list(uint256) external view returns (uint256, uint256);
    function urns(uint256) external view returns (address);
    function ilks(uint256) external view returns (bytes32);
}


/**
 * @title Debt adapter for MCD protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract MCDDebtAdapter is ProtocolAdapter, MKRAdapter {

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
        DssCdpManager manager = DssCdpManager(MANAGER);
        Vat vat = Vat(VAT);
        Jug jug = Jug(JUG);
        uint256 id = manager.first(account);
        uint256 totalValue = 0;

        while (id > 0) {
            bytes32 ilk = manager.ilks(id);
            (, id) = manager.list(id);
            (, uint256 art) = vat.urns(ilk, manager.urns(id));
            (, uint256 storedRate) = vat.ilks(ilk);
            (uint256 duty, uint256 rho) = jug.ilks(ilk);
            uint256 base = jug.base();
            // solhint-disable-next-line not-rely-on-time
            uint256 currentRate = mkrRmul(mkrRpow(mkrAdd(base, duty), now - rho, ONE), storedRate);

            totalValue = totalValue + mkrRmul(art, currentRate);
        }

        return totalValue;
    }
}
