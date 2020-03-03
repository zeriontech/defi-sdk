pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { TokenInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveLiquidityAdapter contract are added.
 * The stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
// solhint-disable-next-line contract-name-camelcase
interface stableswap {
    function coins(int128) external view returns (address);
    function balances(int128) external view returns (uint256);
}


/**
 * @title Adapter for Curve pool tokens.
 * @dev Implementation of TokenAdapter interface.
 */
contract CurveTokenAdapter is TokenAdapter {

    address internal constant COMPOUND_POOL_TOKEN = 0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2;
    address internal constant Y_POOL_TOKEN = 0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8;

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
        (stableswap ss, uint256 length, string memory tokenType) = getPoolInfo(token);
        Token[] memory underlyingTokens = new Token[](length);

        for (uint256 i = 0; i < length; i++) {
            underlyingTokens[i] = Token({
                tokenAddress: ss.coins(int128(i)),
                tokenType: tokenType,
                value: ss.balances(int128(i)) * 1e18 / ERC20(token).totalSupply()
            });
        }

        return underlyingTokens;
    }

    /**
     * @return Stableswap address, number of coins, type of tokens inside.
     */
    function getPoolInfo(address token) internal pure returns (stableswap, uint256, string memory) {
        if (token == COMPOUND_POOL_TOKEN) {
            return (stableswap(0x2e60CF74d81ac34eB21eEff58Db4D385920ef419), 2, "CToken");
        } else if (token == Y_POOL_TOKEN) {
            return (stableswap(0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51), 4, "YToken");
        } else {
            return (stableswap(address(0)), 0, "");
        }
    }
}
