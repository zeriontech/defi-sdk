pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { CurveLiquidityAdapter } from "./CurveLiquidityAdapter.sol";

/**
 * @title Adapter for Curve protocol (Y pool).
 * @dev Implementation of CurveLiquidityAdapter abstract contract.
 */
contract CurveYLiquidityAdapter is CurveLiquidityAdapter {

    /**
     * @return Name of Curve pool.
     */
    function getProtocolName() internal pure override returns (string memory) {
        return "Curve ∙ Y pool";
    }

    /**
     * @return Type of protocol token.
     */
    function getTokenType() internal pure override returns (string memory) {
        return "Curve token";
    }
}
