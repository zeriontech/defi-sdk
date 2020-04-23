// Copyright (C) 2020 Zerion Inc. <https://zerion.io>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


/**
 * @dev PieSmartPool contract interface.
 * Only the functions required for UniswapAdapter contract are added.
 * The BPool contract is available here
 * github.com/balancer-labs/balancer-core/blob/master/contracts/BPool.sol.
 */
interface IPieSmartPool {
    function getTokens() external view returns (address[] memory);
    function getBPool() external view returns (address);
}


/**
 * @dev BPool contract interface.
 * Only the functions required for UniswapAdapter contract are added.
 * The BPool contract is available here
 * github.com/balancer-labs/balancer-core/blob/master/contracts/BPool.sol.
 */
interface BPool {
    function getFinalTokens() external view returns (address[] memory);
    function getBalance(address) external view returns (uint256);
    function getNormalizedWeight(address) external view returns (uint256);
}


/**
 * @title Token adapter for Pie pool tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Mick de Graaf <mick@dexlab.io>
 */
contract PieDAOPieTokenAdapter is TokenAdapter {

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
        address[] memory underlyingTokensAddresses = IPieSmartPool(token).getTokens();
        uint256 totalSupply = ERC20(token).totalSupply();
        BPool bPool = BPool(IPieSmartPool(token).getBPool());

        Component[] memory underlyingTokens = new Component[](underlyingTokensAddresses.length);
        address underlyingToken;

        for (uint256 i = 0; i < underlyingTokens.length; i++) {
            underlyingToken = underlyingTokensAddresses[i];
            underlyingTokens[i] = Component({
                token: underlyingToken,
                tokenType: "ERC20",
                rate: bPool.getBalance(underlyingToken) * 1e18 / totalSupply
            });
        }

        return underlyingTokens;
    }

}
