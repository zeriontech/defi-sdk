pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import "../adapters/Adapter.sol";


contract MockAdapter is Adapter {

    mapping (address => int256) internal balances;

    constructor() public {
        balances[msg.sender] = 1000;
    }

    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Mock",
            description: "Mock protocol",
            pic: "mock.png",
            version: uint256(1)
        });
    }

    function getAssetBalance(
        address asset,
        address user
    )
        external
        view
        override
        returns (AssetBalance memory)
    {
        return AssetBalance({
            asset: getAsset(asset),
            balance: balances[user]
        });
    }

    function getAssetRate(address asset) external view override returns (AssetRate memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            underlying: getAsset(address(this)),
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
            decimals: uint8(18),
            symbol: "MOCK"
        });
    }
}
