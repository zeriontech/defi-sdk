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

pragma solidity 0.8.1;

import { AdapterManager } from "./AdapterManager.sol";
import { TokenAdapterNamesManager } from "./TokenAdapterNamesManager.sol";
import {
    FullTokenBalance,
    TokenBalanceMeta,
    ERC20Metadata,
    AdapterBalance,
    TokenBalance,
    Component
} from "../shared/Structs.sol";
import { Ownable } from "../shared/Ownable.sol";
import { TokenAdapter } from "../tokenAdapters/TokenAdapter.sol";
import { ERC20 } from "../interfaces/ERC20.sol";

/**
 * @title Registry for token adapters.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenAdapterRegistry is Ownable, AdapterManager, TokenAdapterNamesManager {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Fills in FullTokenBalance structs with underlying components.
     * @param tokenBalances Array of TokenBalance structs consisting of
     *     token addresses and amounts.
     * @return fullTokenBalances Full absolute token amounts by TokenBalance structs.
     */
    function getFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        returns (FullTokenBalance[] memory fullTokenBalances)
    {
        uint256 length = tokenBalances.length;

        fullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            fullTokenBalances[i] = getFullTokenBalance(tokenBalances[i]);
        }

        return fullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with final underlying components.
     * @param tokenBalances Array of TokenBalance structs consisting of
     *     token addresses and amounts.
     * @return finalFullTokenBalances Final full absolute token amounts by TokenBalance structs.
     */
    function getFinalFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        returns (FullTokenBalance[] memory finalFullTokenBalances)
    {
        uint256 length = tokenBalances.length;

        finalFullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            finalFullTokenBalances[i] = getFinalFullTokenBalance(tokenBalances[i]);
        }

        return finalFullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with underlying components.
     * @dev Amount is considered to be 10 ** decimals.
     * @param tokens Array of token addresses.
     * @return fullTokenBalances Full absolute token amounts by token addresses.
     */
    function getFullTokenBalances(address[] calldata tokens)
        external
        returns (FullTokenBalance[] memory fullTokenBalances)
    {
        uint256 length = tokens.length;

        fullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            address token = tokens[i];
            uint8 decimals = token == ETH ? 18 : ERC20(token).decimals();

            fullTokenBalances[i] = getFullTokenBalance(
                TokenBalance({ token: token, amount: int256(10)**decimals })
            );
        }

        return fullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with final underlying components.
     * @dev Amount is considered to be 10 ** decimals.
     * @param tokens Array of token addresses.
     * @return finalFullTokenBalances Final full absolute token amounts by token addresses.
     */
    function getFinalFullTokenBalances(address[] calldata tokens)
        external
        returns (FullTokenBalance[] memory finalFullTokenBalances)
    {
        uint256 length = tokens.length;

        finalFullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            address token = tokens[i];
            uint8 decimals = token == ETH ? 18 : ERC20(token).decimals();

            finalFullTokenBalances[i] = getFinalFullTokenBalance(
                TokenBalance({ token: token, amount: int256(10)**decimals })
            );
        }

        return finalFullTokenBalances;
    }

    /**
     * @dev Fills in FullTokenBalance struct with underlying components.
     * @param tokenBalance TokenBalance struct consisting of
     *     token address and its absolute amount.
     * @return Full absolute token amount by token address and absolute amount.
     */
    function getFullTokenBalance(TokenBalance memory tokenBalance)
        internal
        returns (FullTokenBalance memory)
    {
        return getFullTokenBalance(tokenBalance, getComponents(tokenBalance));
    }

    /**
     * @dev Fills in FullTokenBalance struct with final underlying components.
     * @param tokenBalance TokenBalance struct consisting of
     *     token address and its absolute amount.
     * @return Final full absolute token amount by token address and absolute amount.
     */
    function getFinalFullTokenBalance(TokenBalance memory tokenBalance)
        internal
        returns (FullTokenBalance memory)
    {
        return getFullTokenBalance(tokenBalance, getFinalComponents(tokenBalance));
    }

    /**
     * @dev Fills in FullTokenBalance struct with underlying components.
     * @param tokenBalance TokenBalance struct consisting of
     * token address and its absolute amount.
     * @param components Component struct consisting of
     *     token address and its absolute amount for each component.
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
            address token = components[i].token;
            componentTokenBalances[i] = TokenBalanceMeta({
                tokenBalance: TokenBalance({
                    token: token,
                    amount: (components[i].rate * tokenBalance.amount) / int256(1e18)
                }),
                erc20metadata: getERC20Metadata(token)
            });
        }

        return
            FullTokenBalance({
                base: TokenBalanceMeta({
                    tokenBalance: tokenBalance,
                    erc20metadata: getERC20Metadata(tokenBalance.token)
                }),
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

        uint256 finalComponentsNumber = getFinalComponentsNumber(tokenBalance, true);
        Component[] memory finalComponents = new Component[](finalComponentsNumber);

        Component[] memory components = getComponents(tokenBalance);
        uint256 componentsNumber = components.length;

        Component[] memory tempComponents;
        uint256 tempComponentsNumber;

        for (uint256 i = 0; i < componentsNumber; i++) {
            tempComponents = getFinalComponents(
                TokenBalance({
                    token: components[i].token,
                    amount: (components[i].rate * tokenBalance.amount) / int256(1e18)
                })
            );

            tempComponentsNumber = tempComponents.length;

            if (tempComponentsNumber == 0) {
                finalComponents[counter] = components[i];
                counter = counter + 1;
            } else {
                for (uint256 j = 0; j < tempComponentsNumber; j++) {
                    finalComponents[counter + j] = tempComponents[j];
                }

                counter = counter + tempComponentsNumber;
            }
        }

        return finalComponents;
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of
     *     token address and absolute amount.
     * @param initial Whether the function call is initial or recursive.
     * @return Final tokens number by absolute token amount.
     */
    function getFinalComponentsNumber(TokenBalance memory tokenBalance, bool initial)
        internal
        returns (uint256)
    {
        uint256 finalComponentsNumber = 0;
        Component[] memory components = getComponents(tokenBalance);

        if (components.length == 0) {
            return initial ? uint256(0) : uint256(1);
        }
        for (uint256 i = 0; i < components.length; i++) {
            finalComponentsNumber =
                finalComponentsNumber +
                getFinalComponentsNumber(
                    TokenBalance({
                        token: components[i].token,
                        amount: (components[i].rate * tokenBalance.amount) / int256(1e18)
                    }),
                    false
                );
        }

        return finalComponentsNumber;
    }

    /**
     * @param tokenBalance Struct consisting of
     *     token address and absolute amount.
     * @return Array of Component structs by token address and absolute amount.
     */
    function getComponents(TokenBalance memory tokenBalance)
        internal
        returns (Component[] memory)
    {
        address tokenAdapter = getTokenAdapter(tokenBalance.token);

        if (tokenAdapter == address(0)) {
            return new Component[](0);
        }

        try TokenAdapter(tokenAdapter).getComponents(tokenBalance.token) returns (
            Component[] memory components
        ) {
            return components;
        } catch {
            return new Component[](0);
        }
    }

    /**
     * @dev Fills in TokenBalanceMeta struct for TokenBalance struct.
     * @param token The token address.
     * @return ERC20Metadata struct by token address.
     */
    function getERC20Metadata(address token) internal view returns (ERC20Metadata memory) {
        address tokenAdapter = getTokenAdapter(token);

        if (tokenAdapter == address(0)) {
            return ERC20Metadata({ name: "Not available", symbol: "N/A", decimals: 0 });
        }

        try TokenAdapter(tokenAdapter).getERC20Metadata(token) returns (
            ERC20Metadata memory erc20Metadata
        ) {
            return erc20Metadata;
        } catch {
            return ERC20Metadata({ name: "Not available", symbol: "N/A", decimals: 0 });
        }
    }

    /**
     * @dev Gets token adapter address for the given token address.
     * @param token Address of the token.
     * @return Token adapter address.
     */
    function getTokenAdapter(address token) internal view returns (address) {
        bytes32 tokenAdapterName = getTokenAdapterName(token);
        address tokenAdapter = getAdapterAddress(tokenAdapterName);

        return tokenAdapter;
    }
}
