pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { CompoundRegistry } from "./CompoundRegistry.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundTokenAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function exchangeRateStored() external view returns (uint256);
    function underlying() external view returns (address);
}


/**
 * @title Adapter for CTokens.
 * @dev Implementation of TokenAdapter interface.
 */
contract CompoundTokenAdapter is TokenAdapter {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;

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
        Component[] memory underlyingTokens = new Component[](1);

        underlyingTokens[0] = Component({
            token: getUnderlying(token),
            tokenType: "ERC20",
            rate: CToken(token).exchangeRateStored()
        });

        return underlyingTokens;
    }

    /**
     * @dev Internal function to retrieve underlying token.
     */
    function getUnderlying(address token) internal view returns (address) {
        return token == CETH ? ETH : CToken(token).underlying();
    }
}
