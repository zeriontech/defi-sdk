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

pragma solidity 0.6.11;
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
import { ProtocolAdapterManager } from "./ProtocolAdapterManager.sol";
import { ProtocolManager } from "./ProtocolManager.sol";
import { TokenAdapterManager } from "./TokenAdapterManager.sol";
import { ProtocolAdapter } from "../adapters/ProtocolAdapter.sol";
import { TokenAdapter } from "../adapters/TokenAdapter.sol";


/**
 * @title Registry for token adapters and protocol hashes.
 * @notice getBalances() function implements the main functionality.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenAdapterRegistry is Ownable, TokenAdapterManager, ProtocolManager {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @dev Fullfills FullTokenBalance struct for an array of tokens.
     * @param tokenBalances Array of TokenBalance structs consisting of
     * tokenAdapterName, token address, and amount.
     * @return Full token balances by token types and token addresses.
     */
    function getFullTokenBalances(
        TokenBalance[] calldata tokenBalances
    )
        external
        view
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
     * @dev Fullfills FullTokenBalance struct for an array of tokens.
     * @param tokenAdapterNames Array of tokens' types.
     * @param tokens Array of tokens' addresses.
     * @return Full token balances by token types and token addresses.
     */
    function getFullTokenBalances(
        bytes32[] calldata tokenAdapterNames,
        address[] calldata tokens
    )
        external
        view
        returns (FullTokenBalance[] memory)
    {
        uint256 length = tokens.length;
        require(length == tokenAdapterNames.length, "AR: inconsistent arrays!");

        FullTokenBalance[] memory fullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            uint8 decimals = tokens[i] == ETH ? 18 : ERC20(tokens[i]).decimals();

            fullTokenBalances[i] = getFullTokenBalance(
                TokenBalance({
                    tokenAdapterName: tokenAdapterNames[i],
                    token: tokens[i],
                    amount: uint256(10) ** decimals
                })
            );
        }

        return fullTokenBalances;
    }

    /**
     * @dev Fullfills FullTokenBalance struct for a single token.
     * @param tokenBalance Struct consisting of
     * tokenAdapterName, token address, and amount.
     * @return FullTokenBalance struct by the given components.
     */
    function getFullTokenBalance(
        TokenBalance memory tokenBalance
    )
        internal
        view
        returns (FullTokenBalance memory)
    {
        Component[] memory components = getComponents(tokenBalance);
        TokenBalanceMeta[] memory componentTokenBalances =
            new TokenBalanceMeta[](components.length);

        for (uint256 i = 0; i < components.length; i++) {
            componentTokenBalances[i] = getTokenBalanceMeta(
                TokenBalance({
                    tokenAdapterName: "ERC20",
                    token: components[i].token,
                    amount: components[i].rate
                })
            );
        }

        return FullTokenBalance({
            base: getTokenBalanceMeta(tokenBalance),
            underlying: componentTokenBalances
        });
    }

    /**
     * @dev Fetches internal data about underlying components.
     * @param tokenBalance Struct consisting of
     * tokenAdapterName, token address, and amount.
     * @return Components by token type and token address.
     */
    function getComponents(
        TokenBalance memory tokenBalance
    )
        internal
        view
        returns (Component[] memory)
    {
        address tokenAdapter = _tokenAdapterAddress[tokenBalance.tokenAdapterName];
        Component[] memory components;

        if (address(tokenAdapter) != address(0)) {
            try TokenAdapter(tokenAdapter).getComponents(
                tokenBalance.token
            ) returns (Component[] memory result) {
                components = result;
            } catch {
                components = new Component[](0);
            }
        } else {
            components = new Component[](0);
        }

        for (uint256 i = 0; i < components.length; i++) {
            components[i].rate = components[i].rate * tokenBalance.amount / 1e18;
        }

        return components;
    }

    /**
     * @notice Fulfills TokenBalance struct using type, address, and balance of the token.
     * @param tokenBalance Struct consisting of
     * tokenAdapterName, token address, and amount.
     * @return Struct consisting of token's address,
     * amount. and ERC20-style metadata.
     */
    function getTokenBalanceMeta(
        TokenBalance memory tokenBalance
    )
        internal
        view
        returns (TokenBalanceMeta memory)
    {
        address tokenAdapter = _tokenAdapterAddress[tokenBalance.tokenAdapterName];
        ERC20Metadata memory erc20metadata;

        if (tokenAdapter == address(0)) {
            erc20metadata = ERC20Metadata({
                name: "Not available",
                symbol: "N/A",
                decimals: 0
            });
        } else {
            try TokenAdapter(tokenAdapter).getMetadata(
                tokenBalance.token
            )
                returns (ERC20Metadata memory result)
            {
                erc20metadata = result;
            } catch {
                erc20metadata = ERC20Metadata({
                    name: "Not available",
                    symbol: "N/A",
                    decimals: 0
                });
            }
        }

        return TokenBalanceMeta({
            token: tokenBalance.token,
            amount: tokenBalance.amount,
            erc20metadata: erc20metadata
        });
    }
}
