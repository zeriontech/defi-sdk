pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { CompoundRegistry } from "./CompoundRegistry.sol";
import { TokenInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundBorrowAdapter contract are added.
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
     * @return TokenInfo struct with ERC20-style token info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo(address token) external view override returns (TokenInfo memory) {
        return TokenInfo({
            tokenAddress: token,
            name: ERC20(token).name(),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Token structs with underlying tokens rates for the given asset.
     * @dev Implementation of Adapter interface function.
     */
    function getUnderlyingTokens(address token) external view override returns (Token[] memory) {
        Token[] memory underlyingTokens = new Token[](1);

        underlyingTokens[0] = Token({
            tokenAddress: getUnderlying(token),
            tokenType: "ERC20",
            value: CToken(token).exchangeRateStored()
        });

        return underlyingTokens;
    }

    function getUnderlying(address token) internal view returns (address) {
        return token == CETH ? ETH : CToken(token).underlying();
    }
}
