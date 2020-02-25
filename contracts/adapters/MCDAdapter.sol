pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { MKRAdapter } from "./MKRAdapter.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Vat contract interface.
 * Only the functions required for MCDAdapter contract are added.
 * The Vat contract is available here
 * github.com/makerdao/dss/blob/master/src/vat.sol.
 */
interface Vat {
    function urns(bytes32, address) external view returns(uint256, uint256);
    function ilks(bytes32) external view returns(uint256, uint256);
}


/**
 * @dev Jug contract interface.
 * Only the functions required for MCDAdapter contract are added.
 * The Jug contract is available here
 * github.com/makerdao/dss/blob/master/src/jug.sol.
 */
interface Jug {
    function ilks(bytes32) external view returns(uint256, uint256);
    function base() external view returns(uint256);
}


/**
 * @dev DssCdpManager contract interface.
 * Only the functions required for MCDAdapter contract are added.
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
 * @title Adapter for MCD protocol.
 * @dev Implementation of Adapter interface.
 */
contract MCDAdapter is Adapter, MKRAdapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Multi-Collateral Dai",
            description: "Collateralized loans on Maker",
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
        int256 amount;
        int256 totalAmount = 0;

        if (asset == DAI) {
            Jug jug = Jug(JUG);
            uint256 art;
            uint256 duty;
            uint256 rho;
            uint256 base;
            uint256 storedRate;
            uint256 currentRate;

            while (id > 0) {
                urn = manager.urns(id);
                ilk = manager.ilks(id);
                (, id) = manager.list(id);
                (, art) = vat.urns(ilk, urn);
                (, storedRate) = vat.ilks(ilk);
                (duty, rho) = jug.ilks(ilk);
                base = jug.base();
                // solhint-disable-next-line not-rely-on-time
                currentRate = mkrRmul(mkrRpow(mkrAdd(base, duty), now - rho, ONE), storedRate);
                amount = -int256(mkrRmul(art, currentRate));

                totalAmount = totalAmount + amount;
            }
        } else {
            uint256 ink;

            while (id > 0) {
                urn = manager.urns(id);
                ilk = manager.ilks(id);
                (, id) = manager.list(id);
                (ink, ) = vat.urns(ilk, urn);

                if (asset == WETH && ilk == "ETH-A" || asset == BAT && ilk == "BAT-A") {
                    amount = int256(ink);
                } else {
                    amount = 0;
                }

                totalAmount = totalAmount + amount;
            }
        }

        return AssetBalance({
            asset: getAsset(asset),
            balance: totalAmount
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
