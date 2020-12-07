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
//
// SPDX-License-Identifier: LGPL-3.0-only

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import {
    FullTokenBalance,
    TokenBalanceMeta,
    ERC20Metadata,
    AdapterBalance,
    TokenBalance,
    Component
} from "../shared/Structs.sol";
import { ERC20 } from "../shared/ERC20.sol";
import { Ownable } from "./Ownable.sol";
import { TokenAdapterNamesManager } from "./TokenAdapterNamesManager.sol";
import { TokenAdapterManager } from "./TokenAdapterManager.sol";
import { TokenAdapter } from "../adapters/TokenAdapter.sol";

/**
 * @title Registry for token adapters and protocol hashes.
 * @notice getBalances() function implements the main functionality.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenAdapterRegistry is Ownable, TokenAdapterManager, TokenAdapterNamesManager {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Fills in FullTokenBalance structs with underlying components.
     * @param tokenBalances Array of TokenBalance structs consisting of
     * token addresses and amounts.
     * @return Full absolute token amounts by token addresses and absolute amounts.
     */
    function getFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        returns (FullTokenBalance[] memory)
    {
        uint256 length = tokenBalances.length;

        FullTokenBalance[] memory fullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            fullTokenBalances[i] = getFullTokenBalance(tokenBalances[i]);
        }

        return fullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with final underlying components.
     * @param tokenBalances Array of TokenBalance structs consisting of
     * token addresses and amounts.
     * @return Final full absolute token amounts by token addresses and absolute amounts.
     */
    function getFinalFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        returns (FullTokenBalance[] memory)
    {
        uint256 length = tokenBalances.length;

        FullTokenBalance[] memory finalFullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            finalFullTokenBalances[i] = getFinalFullTokenBalance(tokenBalances[i]);
        }

        return finalFullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with underlying components.
     * @dev Amount is considered to be 10 ** decimals.
     * @param tokens Array of token addresses.
     * @return Full absolute token amounts by token addresses.
     */
    function getFullTokenBalances(address[] calldata tokens)
        external
        returns (FullTokenBalance[] memory)
    {
        uint256 length = tokens.length;

        FullTokenBalance[] memory fullTokenBalances = new FullTokenBalance[](length);

        uint8 decimals;
        for (uint256 i = 0; i < length; i++) {
            decimals = tokens[i] == ETH ? 18 : ERC20(tokens[i]).decimals();

            fullTokenBalances[i] = getFullTokenBalance(
                TokenBalance({ token: tokens[i], amount: int256(10)**decimals })
            );
        }

        return fullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with final underlying components.
     * @dev Amount is considered to be 10 ** decimals.
     * @param tokens Array of token addresses.
     * @return Final full absolute token amounts by token addresses.
     */
    function getFinalFullTokenBalances(address[] calldata tokens)
        external
        returns (FullTokenBalance[] memory)
    {
        uint256 length = tokens.length;

        FullTokenBalance[] memory finalFullTokenBalances = new FullTokenBalance[](length);

        uint8 decimals;
        for (uint256 i = 0; i < length; i++) {
            decimals = tokens[i] == ETH ? 18 : ERC20(tokens[i]).decimals();

            finalFullTokenBalances[i] = getFinalFullTokenBalance(
                TokenBalance({ token: tokens[i], amount: int256(10)**decimals })
            );
        }

        return finalFullTokenBalances;
    }

    /**
     * @dev Fills in FullTokenBalance struct with underlying components.
     * @param tokenBalance TokenBalance struct consisting of
     * token address and its absolute amount.
     * @return Full absolute token amount by token address and absolute amount.
     */
    function getFullTokenBalance(TokenBalance memory tokenBalance)
        internal
        returns (FullTokenBalance memory)
    {
        Component[] memory components = getComponents(tokenBalance);

        return getFullTokenBalance(tokenBalance, components);
    }

    /**
     * @dev Fills in FullTokenBalance struct with final underlying components.
     * @param tokenBalance TokenBalance struct consisting of
     * token address and its absolute amount.
     * @return Final full absolute token amount by token address and absolute amount.
     */
    function getFinalFullTokenBalance(TokenBalance memory tokenBalance)
        internal
        returns (FullTokenBalance memory)
    {
        Component[] memory components = getFinalComponents(tokenBalance);

        return getFullTokenBalance(tokenBalance, components);
    }

    /**
     * @dev Fills in FullTokenBalance struct with underlying components.
     * @param tokenBalance TokenBalance struct consisting of
     * token address and its absolute amount.
     * @param components Component struct consisting of
     * token address and its absolute amount for each component.
     * @return Full absolute token amount by token address, absolute amount, and components.
     */
    function getFullTokenBalance(TokenBalance memory tokenBalance, Component[] memory components)
        internal
        view
        returns (FullTokenBalance memory)
    {
        uint256 length = components.length;
        TokenBalanceMeta[] memory componentTokenBalances = new TokenBalanceMeta[](length);

        for (uint256 i = 0; i < length; i++) {
            componentTokenBalances[i] = getTokenBalanceMeta(
                TokenBalance({
                    token: components[i].token,
                    amount: (components[i].rate * tokenBalance.amount) / int256(1e18)
                })
            );
        }

        return
            FullTokenBalance({
                base: getTokenBalanceMeta(tokenBalance),
                underlying: componentTokenBalances
            });
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of
     * token address and absolute amount.
     * @return Final components by absolute token amount.
     */
    function getFinalComponents(TokenBalance memory tokenBalance)
        internal
        returns (Component[] memory)
    {
        uint256 counter = 0;

        uint256 finalComponentsLength = getFinalComponentsLength(tokenBalance, true);
        Component[] memory finalComponents = new Component[](finalComponentsLength);

        Component[] memory components = getComponents(tokenBalance);
        uint256 componentsLength = components.length;

        Component[] memory tempComponents;
        uint256 tempComponentsLength;

        for (uint256 i = 0; i < componentsLength; i++) {
            tempComponents = getFinalComponents(
                TokenBalance({
                    token: components[i].token,
                    amount: (components[i].rate * tokenBalance.amount) / int256(1e18)
                })
            );

            tempComponentsLength = tempComponents.length;

            if (tempComponentsLength == 0) {
                finalComponents[counter] = components[i];
                counter = counter + 1;
            } else {
                for (uint256 j = 0; j < tempComponentsLength; j++) {
                    finalComponents[counter + j] = tempComponents[j];
                }

                counter = counter + tempComponentsLength;
            }
        }

        return finalComponents;
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of
     * token address and absolute amount.
     * @param initial Whether the function call is initial or recursive.
     * @return Final tokens number by absolute token amount.
     */
    function getFinalComponentsLength(TokenBalance memory tokenBalance, bool initial)
        internal
        returns (uint256)
    {
        uint256 finalComponentsLength = 0;
        Component[] memory components = getComponents(tokenBalance);

        if (components.length == 0) {
            return initial ? uint256(0) : uint256(1);
        }

        for (uint256 i = 0; i < components.length; i++) {
            finalComponentsLength =
                finalComponentsLength +
                getFinalComponentsLength(tokenBalance, false);
        }

        return finalComponentsLength;
    }

    /**
     * @dev Fetches internal data about underlying components.
     * @param tokenBalance Struct consisting of
     * token address and absolute amount.
     * @return Array of Component structs by token address and absolute amount.
     */
    function getComponents(TokenBalance memory tokenBalance)
        internal
        returns (Component[] memory)
    {
        address tokenAdapter = getTokenAdapter(tokenBalance.token);
        Component[] memory components;

        if (tokenAdapter == address(0)) {
            components = new Component[](0);
        } else {
            try TokenAdapter(tokenAdapter).getComponents(tokenBalance.token) returns (
                Component[] memory result
            ) {
                components = result;
            } catch {
                components = new Component[](0);
            }
        }

        return components;
    }

    /**
     * @dev Fills in TokenBalanceMeta for TokenBalance struct.
     * @param tokenBalance Struct consisting of
     * token address and absolute amount.
     * @return TokenBalanceMeta struct by token address and absolute amount.
     */
    function getTokenBalanceMeta(TokenBalance memory tokenBalance)
        internal
        view
        returns (TokenBalanceMeta memory)
    {
        address tokenAdapter = getTokenAdapter(tokenBalance.token);
        ERC20Metadata memory erc20metadata;

        if (tokenAdapter == address(0)) {
            erc20metadata = ERC20Metadata({ name: "Not available", symbol: "N/A", decimals: 0 });
        } else {
            try TokenAdapter(tokenAdapter).getMetadata(tokenBalance.token) returns (
                ERC20Metadata memory result
            ) {
                erc20metadata = result;
            } catch {
                erc20metadata = ERC20Metadata({
                    name: "Not available",
                    symbol: "N/A",
                    decimals: 0
                });
            }
        }

        return TokenBalanceMeta({ tokenBalance: tokenBalance, erc20metadata: erc20metadata });
    }

    /**
     * @dev Gets token adapter address for the given token address.
     * @param token Address of the token.
     * @return Token adapter address.
     */
    function getTokenAdapter(address token) internal view returns (address) {
        bytes32 tokenAdapterName = getTokenAdapterName(token);
        address tokenAdapter = getTokenAdapterAddress(tokenAdapterName);

        return tokenAdapter;
    }
}
