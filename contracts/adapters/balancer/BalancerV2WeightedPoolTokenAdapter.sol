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
 * @dev WeightedPool contract interface.
 * Only the functions required for BalancerWeightedPoolTokenAdapter contract are added.
 * The WeightedPool contract is available here
 * github.com/balancer-labs/balancer-core-v2/blob/master/contracts/pools/weighted/WeightedPool.sol.
 */
interface WeightedPool {
    function getPoolId() external view returns (bytes32);
    function getVault() external view returns (address);
}


/**
 * @dev Vault contract interface.
 * Only the functions required for BalancerWeightedPoolTokenAdapter contract are added.
 * The Vault contract is available here
 * https://github.com/balancer-labs/balancer-core-v2/blob/master/contracts/vault/Vault.sol.
 */
interface Vault {
    function getPoolTokens(bytes32 poolId)
        external
        view
        returns (
            address[] memory tokens,
            uint256[] memory balances,
            uint256 lastChangeBlock
        );
}


/**
 * @title Token adapter for Balancer V2 weighted pool tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BalancerV2WeightedPoolTokenAdapter is TokenAdapter {

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
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        bytes32 poolId = WeightedPool(token).getPoolId();
        address vault = WeightedPool(token).getVault();
        (address[] memory tokens, uint256[] memory balances,) = Vault(vault).getPoolTokens(poolId);
        uint256 totalSupply = ERC20(token).totalSupply();

        Component[] memory underlyingTokens = new Component[](tokens.length);

        for (uint256 i = 0; i < underlyingTokens.length; i++) {
            underlyingTokens[i] = Component({
                token: tokens[i],
                tokenType: "ERC20",
                rate: totalSupply == 0 ? 0 : balances[i] * 1e18 / totalSupply
            });
        }

        return underlyingTokens;
    }
}
