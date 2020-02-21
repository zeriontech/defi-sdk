pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { MKRAdapter } from "./MKRAdapter.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Pot contract interface.
 * Only the functions required for DSRAdapter contract are added.
 * The Pot contract is available here
 * github.com/makerdao/dss/blob/master/src/pot.sol.
 */
interface Pot {
    function pie(address) external view returns(uint256);
    function dsr() external view returns(uint256);
    function rho() external view returns(uint256);
    function chi() external view returns(uint256);
}


/**
 * @title Adapter for DSR protocol.
 * @dev Implementation of Adapter interface.
 */
contract DSRAdapter is Adapter, MKRAdapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "DSR",
            description: "",
            pic: "",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of DAI locked on the protocol by the given user.
     * @dev Implementation of Adapter interface function.
     * This function repeats the calculations made in drip() function of Pot contract.
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
        Pot pot = Pot(POT);
        // solhint-disable-next-line not-rely-on-time
        uint256 chi = mkrRmul(mkrRpow(pot.dsr(), now - pot.rho(), ONE), pot.chi());
        return AssetBalance({
            asset: getAsset(asset),
            balance: int256(mkrRmul(chi, pot.pie(user)))
        });
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
            decimals: ERC20(asset).decimals(),
            symbol: ERC20(asset).symbol()
        });
    }
}
