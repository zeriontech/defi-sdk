pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { MCDAdapter } from "./MCDAdapter.sol";
import { Protocol, AssetBalance } from "../Structs.sol";


/**
 * @dev Vat contract interface.
 * Only the functions required for MCDDepositAdapter contract are added.
 * The Vat contract is available here
 * github.com/makerdao/dss/blob/master/src/vat.sol.
 */
interface Vat {
    function urns(bytes32, address) external view returns(uint256, uint256);
    function ilks(bytes32) external view returns(uint256, uint256);
}


/**
 * @dev Jug contract interface.
 * Only the functions required for MCDDepositAdapter contract are added.
 * The Jug contract is available here
 * github.com/makerdao/dss/blob/master/src/jug.sol.
 */
interface Jug {
    function ilks(bytes32) external view returns(uint256, uint256);
    function base() external view returns(uint256);
}


/**
 * @dev DssCdpManager contract interface.
 * Only the functions required for MCDDepositAdapter contract are added.
 * The DssCdpManager contract is available here
 * github.com/makerdao/dss-cdp-manager/blob/master/src/DssCdpManager.sol.
 */
interface DssCdpManager {
    function first(address) external view returns(uint256);
    function list(uint256) external view returns(uint256, uint256);
    function urns(uint256) external view returns (address);
    function ilks(uint256) external view returns (bytes32);
}


/**
 * @title Adapter for MCD protocol (deposit).
 * @dev Implementation of Adapter interface.
 */
contract MCDDepositAdapter is MCDAdapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Multi-Collateral Dai",
            description: "Collateralized loans on Maker",
            class: "Deposit",
            icon: "https://protocol-icons.s3.amazonaws.com/maker.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of collateral/debt locked on the protocol by the given user.
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
        DssCdpManager manager = DssCdpManager(MANAGER);
        Vat vat = Vat(VAT);
        uint256 id = manager.first(user);
        address urn;
        bytes32 ilk;
        uint256 amount;
        uint256 totalAmount = 0;
        uint256 ink;

        while (id > 0) {
            urn = manager.urns(id);
            ilk = manager.ilks(id);
            (, id) = manager.list(id);
            (ink, ) = vat.urns(ilk, urn);

            if (asset == WETH && ilk == "ETH-A" || asset == BAT && ilk == "BAT-A") {
                amount = uint256(ink);
            } else {
                amount = 0;
            }

            totalAmount = totalAmount + amount;
        }

        return AssetBalance({
            asset: getAsset(asset),
            balance: totalAmount
        });
    }
}
