pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev LendingPoolAddressesProvider contract interface.
 * Only the functions required for AaveAdapter contract are added.
 * The LendingPoolAddressesProvider contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/configuration/LendingPoolAddressesProvider.sol.
 */
interface LendingPoolAddressesProvider {
    function getLendingPool() external view returns (LendingPool);
}


/**
 * @dev LendingPool contract interface.
 * Only the functions required for AaveAdapter contract are added.
 * The LendingPool contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/lendingpool/LendingPool.sol.
 */
interface LendingPool {
    function getUserReserveData(address, address)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        );
}


/**
 * @dev Proxy contract interface.
 * Only the functions required for AaveAdapter contract are added.
 * The Synthetix contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @title Adapter for Aave protocol.
 * @dev Implementation of Adapter interface.
 */
contract AaveAdapter is Adapter {

    address internal constant PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SNX = 0xC011A72400E58ecD99Ee497CF89E3775d4bd732F;

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Aave",
            description: "",
            pic: "",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of the given asset locked on the protocol by the given user.
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
        LendingPool pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();
        // solium-disable-next-line operator-whitespace
        (uint256 depositAmount, uint256 debtAmount, , , , , , , , ) =
            pool.getUserReserveData(asset, user);

        return AssetBalance({
            asset: getAsset(asset),
            balance: depositAmount > 0 ? int256(depositAmount) : -int256(debtAmount)
        });
    }

    /**
     * @return Component structs array with underlying assets rates for the given asset.
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
        if (asset == ETH) {
            return Asset({
                contractAddress: ETH,
                decimals: uint8(18),
                symbol: "ETH"
            });
        } else if (asset == SNX) {
            return Asset({
                contractAddress: asset,
                decimals: ERC20(Proxy(asset).target()).decimals(),
                symbol: ERC20(Proxy(asset).target()).symbol()
            });
        } else {
            return Asset({
                contractAddress: asset,
                decimals: ERC20(asset).decimals(),
                symbol: ERC20(asset).symbol()
            });
        }
    }
}
