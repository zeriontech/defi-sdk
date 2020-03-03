pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { TokenInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapLiquidityAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy.
 */
interface Exchange {
    function name() external view returns (bytes32);
    function symbol() external view returns (bytes32);
    function decimals() external view returns (uint256);
}

/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapLiquidityAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getToken(address) external view returns (address);
}


/**
 * @dev Proxy contract interface.
 * Only the functions required for UniswapLiquidityAdapter contract are added.
 * The Proxy contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @title Adapter for Uniswap pool tokens.
 * @dev Implementation of Adapter interface.
 */
contract UniswapTokenAdapter is TokenAdapter {

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SNX = 0xC011A72400E58ecD99Ee497CF89E3775d4bd732F;
    address internal constant SUSD = 0x57Ab1ec28D129707052df4dF418D58a2D46d5f51;

    /**
     * @return TokenInfo struct with ERC20-style token info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo(address token) external view override returns (TokenInfo memory) {
        return TokenInfo({
            tokenAddress: token,
            name: getPoolName(token),
            symbol: "UNI",
            decimals: uint8(Exchange(token).decimals())
        });
    }

    /**
     * @return Array of Token structs with underlying tokens rates for the given asset.
     * @dev Implementation of Adapter interface function.
     */
    function getUnderlyingTokens(address token) external view override returns (Token[] memory) {
        address underlying = Factory(FACTORY).getToken(token);
        uint256 totalSupply = ERC20(token).totalSupply();
        Token[] memory underlyingTokens = new Token[](2);

        underlyingTokens[0] = Token({
            tokenAddress: ETH,
            tokenType: "ERC20",
            value: token.balance * 1e18 / totalSupply
        });
        underlyingTokens[1] = Token({
            tokenAddress: underlying,
            tokenType: "ERC20",
            value: ERC20(underlying).balanceOf(token) * 1e18 / totalSupply
        });

        return underlyingTokens;
    }

    function getPoolName(address token) internal view returns (string memory) {
        address underlying = Factory(FACTORY).getToken(token);
        return string(abi.encodePacked("Uniswap ", getSymbol(underlying), " pool"));
    }

    function getSymbol(address token) internal view returns (string memory) {
        (bool success, bytes memory returndata) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).symbol.selector)
        );
        require(success, "UNI: underlying symbol() call failed!");
        if (returndata.length == 32) {
            return convertToString(abi.decode(returndata, (bytes32)));
        } else {
            return abi.decode(returndata, (string));
        }
    }

    function convertToString(bytes32 data) internal pure returns (string memory) {
        uint256 i = 0;
        uint256 length;
        bytes memory result;

        while(data[i] != byte(0)) {
            i++;
        }

        length = i;
        result = new bytes(length);

        for (i = 0; i < length; i++) {
            result[i] = data[i];
        }

        return string(result);
    }
}
