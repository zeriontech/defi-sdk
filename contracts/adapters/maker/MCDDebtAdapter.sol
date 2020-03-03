pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { MKRAdapter } from "./MKRAdapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";


/**
 * @dev Vat contract interface.
 * Only the functions required for MCDBorrowAdapter contract are added.
 * The Vat contract is available here
 * github.com/makerdao/dss/blob/master/src/vat.sol.
 */
interface Vat {
    function urns(bytes32, address) external view returns (uint256, uint256);
    function ilks(bytes32) external view returns (uint256, uint256);
}


/**
 * @dev Jug contract interface.
 * Only the functions required for MCDBorrowAdapter contract are added.
 * The Jug contract is available here
 * github.com/makerdao/dss/blob/master/src/jug.sol.
 */
interface Jug {
    function ilks(bytes32) external view returns (uint256, uint256);
    function base() external view returns (uint256);
}


/**
 * @dev DssCdpManager contract interface.
 * Only the functions required for MCDBorrowAdapter contract are added.
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
 * @title Adapter for MCD protocol (debt).
 * @dev Implementation of Adapter interface.
 */
contract MCDDebtAdapter is Adapter, MKRAdapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Multi-Collateral Dai",
            description: "Collateralized loans on Maker",
            protocolType: "Debt",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/maker.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of debt of the given user for the protocol.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address, address user) external view override returns (uint256) {
        DssCdpManager manager = DssCdpManager(MANAGER);
        Vat vat = Vat(VAT);
        Jug jug = Jug(JUG);
        uint256 id = manager.first(user);
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
