pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Proxy contract interface.
 * Only the functions required for UniswapLiquidityAdapter contract are added.
 * The Proxy contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @dev Exchange contract interface.
 * Only the functions required for UniswapLiquidityAdapter contract are added.
 * The Exchange contract is available here
 * https://github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy.
 */
interface Exchange {
    function symbol() external view returns (bytes32);
    function decimals() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapLiquidityAdapter contract are added.
 * The Factory contract is available here
 * https://github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getToken(address) external view returns (address);
}


/**
 * @title Adapter for Uniswap protocol.
 * @dev Implementation of Adapter interface.
 */
contract UniswapLiquidityAdapter is Adapter {

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SNX = 0xC011A72400E58ecD99Ee497CF89E3775d4bd732F;
    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address internal constant MKR = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2;

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Uniswap Liquidity",
            description: "Exchange liquidity pool for tokens trading",
            icon: "https://protocol-icons.s3.amazonaws.com/uniswap.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of stableswapToken locked on the protocol by the given user.
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
            balance: int256(Exchange(asset).balanceOf(user))
        });
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter interface function.
     * Repeats calculations made in stableswap contract.
     */
    function getAssetRate(
        address asset
    )
        external
        view
        override
        returns (AssetRate memory)
    {
        Component[] memory components = new Component[](2);

        address underlying = Factory(FACTORY).getToken(asset);
        uint256 totalSupply = Exchange(asset).totalSupply();

        components[0] = Component({
            underlying: getAsset(ETH),
            rate: asset.balance * 1e18 / totalSupply
        });
        components[1] = Component({
            underlying: getAsset(underlying),
            rate: ERC20(underlying).balanceOf(asset) * 1e18 / totalSupply
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
        } else if (asset == SAI) {
            return Asset({
                contractAddress: SAI,
                decimals: uint8(18),
                symbol: "SAI"
            });
        } else if (asset == MKR) {
            return Asset({
                contractAddress: MKR,
                decimals: uint8(18),
                symbol: "MKR"
            });
        } else if (asset == SNX) {
            return Asset({
                contractAddress: SNX,
                decimals: ERC20(Proxy(SNX).target()).decimals(),
                symbol: ERC20(Proxy(SNX).target()).symbol()
            });
        } else {
            address token = Factory(FACTORY).getToken(asset);
            if (token == address(0)) {
                return Asset({
                    contractAddress: asset,
                    decimals: ERC20(asset).decimals(),
                    symbol: ERC20(asset).symbol()
                });
            } else {
                return Asset({
                    contractAddress: asset,
                    decimals: uint8(Exchange(asset).decimals()),
                    symbol: "UNI-V1"
                });
            }
        }
    }
}
