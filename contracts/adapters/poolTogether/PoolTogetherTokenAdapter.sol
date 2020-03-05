pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev BasePool contract interface.
 * Only the functions required for PoolTogetherTokenAdapter contract are added.
 * The BasePool contract is available here
 * github.com/pooltogether/pooltogether-contracts/blob/master/contracts/BasePool.sol.
 */
interface BasePool {
    function token() external view returns (address);
}


/**
 * @title Adapter for PoolTogether pools.
 * @dev Implementation of TokenAdapter interface.
 */
contract PoolTogetherTokenAdapter is TokenAdapter {

    address internal constant SAI_POOL = 0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84;

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: getPoolName(token),
            symbol: "PLT",
            decimals: ERC20(BasePool(token).token()).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        Component[] memory underlyingTokens = new Component[](1);

        underlyingTokens[0] = Component({
            token: BasePool(token).token(),
            tokenType: "ERC20",
            rate: 1e18
        });

        return underlyingTokens;
    }

    function getPoolName(address token) internal view returns (string memory) {
        if (token == SAI_POOL) {
            return "SAI pool";
        } else {
            address underlying = BasePool(token).token();
            return string(abi.encodePacked(ERC20(underlying).symbol(), " pool"));
        }
    }
}
