pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { AssetRate, Component, Asset } from "../Structs.sol";
import { MKRAdapter } from "./MKRAdapter.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Vat contract interface.
 * Only the functions required for MCDDepositAdapter contract are added.
 * The Vat contract is available here
 * github.com/makerdao/dss/blob/master/src/vat.sol.
 */
interface Vat {
    function urns(bytes32, address) external view returns(uint256, uint256);
    function ilks(bytes32) external view returns(uint256, uint256);
}


/**
 * @dev Jug contract interface.
 * Only the functions required for MCDDepositAdapter contract are added.
 * The Jug contract is available here
 * github.com/makerdao/dss/blob/master/src/jug.sol.
 */
interface Jug {
    function ilks(bytes32) external view returns(uint256, uint256);
    function base() external view returns(uint256);
}


/**
 * @dev DssCdpManager contract interface.
 * Only the functions required for MCDDepositAdapter contract are added.
 * The DssCdpManager contract is available here
 * github.com/makerdao/dss-cdp-manager/blob/master/src/DssCdpManager.sol.
 */
interface DssCdpManager {
    function first(address) external view returns(uint256);
    function list(uint256) external view returns(uint256, uint256);
    function urns(uint256) external view returns (address);
    function ilks(uint256) external view returns (bytes32);
}


/**
 * @title Adapter for MCD protocol.
 * @dev Implementation of Adapter interface.
 */
abstract contract MCDAdapter is Adapter, MKRAdapter {

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter interface function.
     */
    function getAssetRate(
        address asset
    )
        external
        view
        override
        returns (AssetRate memory)
    {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            underlying: getAsset(asset),
            rate: uint256(1e18)
        });

        return AssetRate({
            asset: getAsset(asset),
            components: components
        });
    }

    /**
     * @return Asset struct with asset info for the given asset.
     * @dev Implementation of Adapter interface function.
     */
    function getAsset(address asset) public view override returns (Asset memory) {
        return Asset({
            contractAddress: asset,
            decimals: ERC20(asset).decimals(),
            symbol: ERC20(asset).symbol()
        });
    }
}
