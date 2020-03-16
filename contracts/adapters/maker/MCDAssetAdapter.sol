pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { MKRAdapter } from "./MKRAdapter.sol";


/**
 * @dev Vat contract interface.
 * Only the functions required for MCDAssetAdapter contract are added.
 * The Vat contract is available here
 * github.com/makerdao/dss/blob/master/src/vat.sol.
 */
interface Vat {
    function urns(bytes32, address) external view returns (uint256, uint256);
    function ilks(bytes32) external view returns (uint256, uint256);
}


/**
 * @dev Jug contract interface.
 * Only the functions required for MCDAssetAdapter contract are added.
 * The Jug contract is available here
 * github.com/makerdao/dss/blob/master/src/jug.sol.
 */
interface Jug {
    function ilks(bytes32) external view returns (uint256, uint256);
    function base() external view returns (uint256);
}


/**
 * @dev DssCdpManager contract interface.
 * Only the functions required for MCDAssetAdapter contract are added.
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
 * @title Asset adapter for MCD protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract MCDAssetAdapter is ProtocolAdapter, MKRAdapter {

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
     * @return Amount of collateral locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        DssCdpManager manager = DssCdpManager(MANAGER);
        Vat vat = Vat(VAT);
        uint256 id = manager.first(account);
        address urn;
        bytes32 ilk;
        uint256 value;
        uint256 totalValue = 0;
        uint256 ink;

        while (id > 0) {
            urn = manager.urns(id);
            ilk = manager.ilks(id);
            (, id) = manager.list(id);
            (ink, ) = vat.urns(ilk, urn);

            if (token == WETH && ilk == "ETH-A" || token == BAT && ilk == "BAT-A") {
                value = uint256(ink);
            } else {
                value = 0;
            }

            totalValue = totalValue + value;
        }

        return totalValue;
    }
}
