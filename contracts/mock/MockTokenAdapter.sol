pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { TokenMetadata, Component } from "../Structs.sol";
import { TokenAdapter } from "../adapters/TokenAdapter.sol";


contract MockTokenAdapter is TokenAdapter {

    /**
      * @return TokenMetadata struct with ERC20-style token info.
      * @dev Implementation of TokenAdapter interface function.
      */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: "Mock",
            symbol: "MCK",
            decimals: 18
        });
    }

    /**
     * @return Empty Component array.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address) external view override returns (Component[] memory) {
        return new Component[](0);
    }
}
