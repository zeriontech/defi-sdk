pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev AToken contract interface.
 * Only the functions required for AaveTokenAdapter contract are added.
 * The AToken contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/tokenization/AToken.sol.
 */
interface AToken {
    function underlyingAssetAddress() external view returns (address);
}


/**
 * @title Adapter for ATokens.
 * @dev Implementation of TokenAdapter interface.
 */
contract AaveTokenAdapter is TokenAdapter {

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: ERC20(token).name(),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address underlying = AToken(token).underlyingAssetAddress();

        Component[] memory underlyingTokens = new Component[](1);

        underlyingTokens[0] = Component({
            token: underlying,
            tokenType: "ERC20",
            rate: uint256(1e18)
        });

        return underlyingTokens;
    }
}
