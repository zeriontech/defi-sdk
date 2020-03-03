pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { CurveLiquidityAdapter } from "./CurveLiquidityAdapter.sol";

/**
 * @title Adapter for Curve protocol (Compound pool).
 * @dev Implementation of CurveLiquidityAdapter abstract contract.
 */
contract CurveCompoundLiquidityAdapter is CurveLiquidityAdapter {

    /**
     * @return Name of Curve pool.
     */
    function getProtocolName() internal pure override returns (string memory) {
        return "Curve ∙ Compound pool";
    }

    /**
     * @return Type of protocol token.
     */
    function getTokenType() internal pure override returns (string memory) {
        return "Curve token";
    }
}
