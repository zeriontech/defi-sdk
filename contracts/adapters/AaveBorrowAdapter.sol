pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { AaveAdapter } from "./AaveAdapter.sol";
import { Protocol, AssetBalance } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev LendingPoolAddressesProvider contract interface.
 * Only the functions required for AaveDepositAdapter contract are added.
 * The LendingPoolAddressesProvider contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/configuration/LendingPoolAddressesProvider.sol.
 */
interface LendingPoolAddressesProvider {
    function getLendingPool() external view returns (LendingPool);
}


/**
 * @dev LendingPool contract interface.
 * Only the functions required for AaveDepositAdapter contract are added.
 * The LendingPool contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/lendingpool/LendingPool.sol.
 */
interface LendingPool {
    function getUserReserveData(address, address) external view returns (uint256, uint256);
}


/**
 * @title Adapter for Aave protocol (borrow).
 * @dev Implementation of Adapter interface.
 */
contract AaveBorrowAdapter is AaveAdapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Aave",
            description: "Decentralized lending & borrowing protocol",
            class: "Debt",
            icon: "https://protocol-icons.s3.amazonaws.com/aave.png",
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

        (, uint256 debtAmount) = pool.getUserReserveData(asset, user);

        return AssetBalance({
            asset: getAsset(asset),
            balance: debtAmount
        });
    }
}
