pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Proxy contract interface.
 * Only the functions required for SynthetixAdapter contract are added.
 * The Proxy contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @dev Synthetix contract interface.
 * Only the functions required for SynthetixAdapter contract are added.
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
contract SynthetixAdapter is Adapter {

    address internal constant SNX = 0xC011A72400E58ecD99Ee497CF89E3775d4bd732F;
    address internal constant SUSD = 0x57Ab1E02fEE23774580C119740129eAC7081e9D3;

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Synthetix",
            description: "Synthetic assets protocol",
            icon: "https://protocol-icons.s3.amazonaws.com/synthetix.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of SNX locked on the protocol by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getAssetBalance(
        address asset,
        address user
    )
        external
        view
        override
        returns (AssetBalance memory)
    {
        Synthetix synthetix = Synthetix(Proxy(SNX).target());
        if (asset == SUSD) {
            return AssetBalance({
                asset: getAsset(asset),
                balance: -int256(synthetix.debtBalanceOf(user, "sUSD"))
            });
        } else {
            return AssetBalance({
                asset: getAsset(asset),
                balance: int256(synthetix.balanceOf(user) - synthetix.transferableSynthetix(user))
            });
        }
    }

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
