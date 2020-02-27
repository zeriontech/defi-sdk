pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Proxy contract interface.
 * Only the functions required for SynthetixDepositAdapter contract are added.
 * The Proxy contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @dev Synthetix contract interface.
 * Only the functions required for SynthetixDepositAdapter contract are added.
 * The Synthetix contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Synthetix.sol.
 */
interface Synthetix {
    function balanceOf(address) external view returns (uint256);
    function transferableSynthetix(address) external view returns (uint256);
    function debtBalanceOf(address, bytes32) external view returns (uint256);
}


/**
 * @title Adapter for Synthetix protocol.
 * @dev Implementation of Adapter interface.
 */
abstract contract SynthetixAdapter is Adapter {

    address internal constant SNX = 0xC011A72400E58ecD99Ee497CF89E3775d4bd732F;

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
            decimals: ERC20(Proxy(asset).target()).decimals(),
            symbol: ERC20(Proxy(asset).target()).symbol()
        });
    }
}
