pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { SynthetixAdapter } from "./SynthetixAdapter.sol";
import { Protocol, AssetBalance } from "../Structs.sol";


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
}


/**
 * @title Adapter for Synthetix protocol (deposit).
 * @dev Implementation of Adapter interface.
 */
contract SynthetixDepositAdapter is SynthetixAdapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Synthetix",
            description: "Synthetic assets protocol",
            class: "Lock",
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

        return AssetBalance({
            asset: getAsset(asset),
            balance: uint256(synthetix.balanceOf(user) - synthetix.transferableSynthetix(user))
        });
    }
}
