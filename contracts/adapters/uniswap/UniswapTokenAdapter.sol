pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapAdapter contract are added.
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
 * Only the functions required for UniswapAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getToken(address) external view returns (address);
}


/**
 * @title TokenAdapter for Uniswap pool tokens.
 * @dev Implementation of TokenAdapter interface.
 */
contract UniswapTokenAdapter is TokenAdapter {

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SAI_POOL = 0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14;

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: getPoolName(token),
            symbol: "UNI",
            decimals: uint8(Exchange(token).decimals())
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address underlyingToken = Factory(FACTORY).getToken(token);
        uint256 totalSupply = ERC20(token).totalSupply();
        string memory underlyingTokenType;
        Component[] memory underlyingTokens = new Component[](2);

        underlyingTokens[0] = Component({
            token: ETH,
            tokenType: "ERC20",
            rate: token.balance * 1e18 / totalSupply
        });

        underlyingTokenType = "ERC20";

        underlyingTokens[1] = Component({
            token: underlyingToken,
            tokenType: underlyingTokenType,
            rate: ERC20(underlyingToken).balanceOf(token) * 1e18 / totalSupply
        });

        return underlyingTokens;
    }

    function getPoolName(address token) internal view returns (string memory) {
        if (token == SAI_POOL) {
            return "SAI pool";
        } else {
            return string(abi.encodePacked(getSymbol(Factory(FACTORY).getToken(token)), " pool"));
        }
    }

    function getSymbol(address token) internal view returns (string memory) {
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).symbol.selector)
        );

        if (returnData.length == 32) {
            return convertToString(abi.decode(returnData, (bytes32)));
        } else {
            return abi.decode(returnData, (string));
        }
    }

    /**
     * @dev Internal function to convert bytes32 to string.
     */
    function convertToString(bytes32 data) internal pure returns (string memory) {
        uint256 length = 0;
        bytes memory result;

        for (uint256 i = 0; i < 32; i++) {
            if (data[i] != byte(0)) {
                length++;
            }
        }

        result = new bytes(length);

        for (uint256 i = 0; i < length; i++) {
            result[i] = data[i];
        }

        return string(result);
    }
}
