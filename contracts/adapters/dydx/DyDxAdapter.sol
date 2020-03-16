pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;


/**
 * @title Base contract for dYdX adapters.
 */
abstract contract DyDxAdapter {

    address internal constant SOLO = 0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address internal constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    function getMarketId(address token) internal pure returns (uint256) {
        if (token == WETH) {
            return uint256(0);
        } else if (token == SAI) {
            return uint256(1);
        } else if (token == USDC) {
            return uint256(2);
        } else if (token == DAI) {
            return uint256(3);
        } else {
            return uint256(-1);
        }
    }
}
