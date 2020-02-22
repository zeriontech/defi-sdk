pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev InterestRateModel interface.
 * Only the functions required for CompoundAdapter contract are added.
 */
interface InterestRateModel {
    function getBorrowRate(uint256, uint256, uint256) external view returns (uint);
}


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function mint(uint256) external returns (uint256);
    function redeem(uint256) external returns (uint256);
    function isCToken() external returns (bool);
    function balanceOf(address) external view returns (uint256);
    function underlying() external view returns (address);
    function getCash() external view returns(uint256);
    function totalBorrows() external view returns(uint256);
    function totalReserves() external view returns(uint256);
    function totalSupply() external view returns(uint256);
    function interestRateModel() external view returns(InterestRateModel);
    function accrualBlockNumber() external view returns(uint256);
    function reserveFactorMantissa() external view returns(uint256);
}


/**
 * @title Adapter for Compound protocol.
 * @dev Implementation of Adapter abstract contract.
 */
contract CompoundAdapter is Adapter {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Compound",
            description: "",
            icon: "https://protocol-icons.s3.amazonaws.com/compound.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of CToken locked on the protocol by the given user.
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
            balance: int256(CToken(asset).balanceOf(user))
        });
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter interface function.
     * Repeats calculations made in CToken contract.
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
            underlying: getAsset(getUnderlying(asset)),
            rate: getExchangeRate(asset)
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
        } else {
            return Asset({
                contractAddress: asset,
                decimals: ERC20(asset).decimals(),
                symbol: ERC20(asset).symbol()
            });
        }
    }

    function getUnderlying(address asset) internal view returns (address) {
        return asset == CETH ? ETH : CToken(asset).underlying();
    }

    function getExchangeRate(address asset) internal view returns (uint256) {
        CToken cToken = CToken(asset);
        uint256 totalCash = cToken.getCash();
        uint256 totalBorrows = cToken.totalBorrows();
        uint256 totalReserves = cToken.totalReserves();
        uint256 totalSupply = cToken.totalSupply();
        uint256 reserveFactorMantissa = cToken.reserveFactorMantissa();
        uint256 borrowRateMantissa = cToken.interestRateModel().getBorrowRate(
            totalCash,
            totalBorrows,
            totalReserves
        );
        uint256 blockDelta = block.number - cToken.accrualBlockNumber();
        uint256 interestAccumulated = borrowRateMantissa * blockDelta * totalBorrows / 1e18;
        totalBorrows = totalBorrows + interestAccumulated;
        totalReserves = totalReserves + reserveFactorMantissa * interestAccumulated / 1e18;
        uint256 cashPlusBorrowsMinusReserves = totalCash + totalBorrows - totalReserves;
        return cashPlusBorrowsMinusReserves * 1e18 / totalSupply;
    }
}
