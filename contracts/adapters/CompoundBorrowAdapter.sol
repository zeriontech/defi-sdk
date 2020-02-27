pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { CompoundAdapter } from "./CompoundAdapter.sol";
import { CompoundRegistry } from "./CompoundRegistry.sol";
import { Protocol, AssetBalance } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundBorrowAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function borrowBalanceStored(address) external view returns (uint256);
}


/**
 * @title Adapter for Compound protocol (borrow).
 * @dev Implementation of Adapter interface.
 */
contract CompoundBorrowAdapter is CompoundAdapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Compound",
            description: "",
            class: "Borrow",
            icon: "https://protocol-icons.s3.amazonaws.com/compound.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of debt for the protocol by the given user.
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
        CToken cToken = CToken(CompoundRegistry(REGISTRY).getCToken(asset));

        return AssetBalance({
            asset: getAsset(asset),
            balance: cToken.borrowBalanceStored(user)
        });
    }
}
