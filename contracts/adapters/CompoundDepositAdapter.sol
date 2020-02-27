pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { CompoundAdapter } from "./CompoundAdapter.sol";
import { Protocol, AssetBalance } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @title Adapter for Compound protocol (deposit).
 * @dev Implementation of Adapter interface.
 */
contract CompoundDepositAdapter is CompoundAdapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Compound",
            description: "",
            class: "Deposit",
            icon: "https://protocol-icons.s3.amazonaws.com/compound.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of CToken by the given user.
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
        return AssetBalance({
            asset: getAsset(asset),
            balance: ERC20(asset).balanceOf(user)
        });
    }
}
