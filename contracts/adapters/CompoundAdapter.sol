pragma solidity 0.6.1;
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
    CToken internal constant CDAI = CToken(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643);
    CToken internal constant CBAT = CToken(0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E);
    CToken internal constant CETH = CToken(0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5);
    CToken internal constant CREP = CToken(0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1);
    CToken internal constant CSAI = CToken(0xF5DCe57282A584D2746FaF1593d3121Fcac444dC);
    CToken internal constant CZRX = CToken(0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407);
    CToken internal constant CUSDC = CToken(0x39AA39c021dfbaE8faC545936693aC917d5E7563);
    CToken internal constant CWBTC = CToken(0xC11b1268C1A384e55C48c2391d8d480264A3A7F4);
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
    function getAssetAmount(address asset, address user) external view override returns (int128) {
        CToken cToken = CToken(asset);
        if (cToken == CDAI || cToken == CBAT || cToken == CETH ||
            cToken == CREP || cToken == CSAI || cToken == CZRX ||
            cToken == CUSDC || cToken == CWBTC
        ) {
            return int128(cToken.balanceOf(user));
        } else {
            return int128(0);
        }
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     * Repeats calculations made in CToken contract.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components;
        CToken cToken = CToken(asset);

        if (cToken == CDAI || cToken == CBAT || cToken == CETH ||
            cToken == CREP || cToken == CSAI || cToken == CZRX ||
            cToken == CUSDC || cToken == CWBTC
        ) {
            components = new Component[](1);
            components[0] = Component({
                underlying: getUnderlyingAsset(cToken),
                rate: getExchangeRate(cToken)
            });
        } else {
            components = new Component[](0);
        }

        return components;
    }

    function getUnderlyingAsset(CToken cToken) internal view returns (address) {
        return cToken == CETH ? ETH : cToken.underlying();
    }

    function getExchangeRate(CToken cToken) internal view returns (uint256) {
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
