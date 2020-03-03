pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { TokenInfo, Token } from "../../Structs.sol";
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

    address internal constant SNX = 0xC011A72400E58ecD99Ee497CF89E3775d4bd732F;
    address internal constant SUSD = 0x57Ab1ec28D129707052df4dF418D58a2D46d5f51;

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
        address underlying = AToken(token).underlyingAssetAddress();

        Token[] memory underlyingTokens = new Token[](1);

        underlyingTokens[0] = Token({
            tokenAddress: underlying,
            tokenType: "ERC20",
            value: uint256(1e18)
        });

        return underlyingTokens;
    }
}
