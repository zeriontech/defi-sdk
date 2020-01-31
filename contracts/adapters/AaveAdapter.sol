pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";


/**
 * @dev LendingPoolAddressesProvider contract interface.
 * Only the functions required for AaveAdapter contract are added.
 * The LendingPoolAddressesProvider contract is available here
 * https://github.com/aave/aave-protocol/blob/master/contracts/configuration/LendingPoolAddressesProvider.sol.
 */
interface LendingPoolAddressesProvider {
    function getLendingPool() external view returns (LendingPool);
}


/**
 * @dev LendingPool contract interface.
 * Only the functions required for AaveAdapter contract are added.
 * The LendingPool contract is available here
 * https://github.com/aave/aave-protocol/blob/master/contracts/lendingpool/LendingPool.sol.
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
 * @title Adapter for Aave protocol.
 * @dev Implementation of Adapter abstract contract.
 */
contract AaveAdapter is Adapter {

    address internal constant PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("Aave");
    }

    /**
     * @return Amount of asset locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address asset, address user) external view override returns (int128) {
        LendingPool pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();

        (uint256 depositAmount, uint256 debtAmount, , , , , , , , ) =
            pool.getUserReserveData(asset, user);

        return depositAmount > 0 ? int128(depositAmount) : -1 * int128(debtAmount);
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            underlying: asset,
            rate: uint256(1e18)
        });

        return components;
    }
}
