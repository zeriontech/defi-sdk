pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";


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
 * https://github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
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

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("Compound");
    }

    /**
     * @return Amount of CToken locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address asset, address user) external view override returns (int256) {
        return int256(CToken(asset).balanceOf(user));
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     * Repeats calculations made in CToken contract.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            underlying: getUnderlyingAsset(asset),
            rate: getExchangeRate(asset)
        });

        return components;
    }

    function getUnderlyingAsset(address asset) internal view returns (address) {
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
