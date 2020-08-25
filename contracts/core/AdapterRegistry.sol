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
import { TokenAdapterManager } from "./TokenAdapterManager.sol";
import { ProtocolAdapter } from "../adapters/ProtocolAdapter.sol";
import { TokenAdapter } from "../adapters/TokenAdapter.sol";


/**
 * @title Registry for protocols, adapters, and token adapters.
 * @notice getBalances() function implements the main functionality.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AdapterRegistry is Ownable, ProtocolAdapterManager, TokenAdapterManager {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @dev Fills in FullTokenBalance struct for an array of tokens.
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
     * @dev Fills in FullTokenBalance struct for an array of tokens.
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
     * @param account Address of the account.
     * @return AdapterBalance array by the given account.
     * @notice Zero values are filtered out!
     */
    function getBalances(
        address account
    )
        external
        view
        returns (AdapterBalance[] memory)
    {
        // Get balances for all the adapters
        AdapterBalance[] memory adapterBalances = getAdapterBalances(
            _protocolAdapterNames,
            account
        );

        // Declare temp variable and counters
        TokenBalance[] memory currentTokenBalances;
        TokenBalance[] memory nonZeroTokenBalances;
        uint256 nonZeroAdaptersCounter;
        uint256[] memory nonZeroTokensCounters;

        // Reset counters
        nonZeroTokensCounters = new uint256[](adapterBalances.length);
        nonZeroAdaptersCounter = 0;

        // Iterate over all the adapters' balances
        for (uint256 i = 0; i < adapterBalances.length; i++) {
            // Fill temp variable
            currentTokenBalances = adapterBalances[i].tokenBalances;

            // Reset counter
            nonZeroTokensCounters[i] = 0;

            // Increment if token balance is positive
            for (uint256 j = 0; j < currentTokenBalances.length; j++) {
                if (currentTokenBalances[j].amount > 0) {
                    nonZeroTokensCounters[i]++;
                }
            }

            // Increment if at least one positive token balance
            if (nonZeroTokensCounters[i] > 0) {
                nonZeroAdaptersCounter++;
            }
        }

        // Declare resulting variable
        AdapterBalance[] memory nonZeroAdapterBalances;

        // Reset resulting variable and counter
        nonZeroAdapterBalances = new AdapterBalance[](nonZeroAdaptersCounter);
        nonZeroAdaptersCounter = 0;

        // Iterate over all the adapters' balances
        for (uint256 i = 0; i < adapterBalances.length; i++) {
            // Skip if no positive token balances
            if (nonZeroTokensCounters[i] == 0) {
                continue;
            }

            // Else take only positive ones, first with empty tokenBalances, then fill it
            nonZeroAdapterBalances[nonZeroAdaptersCounter] = AdapterBalance({
                protocolAdapterName: adapterBalances[i].protocolAdapterName,
                tokenBalances: new TokenBalance[](nonZeroTokensCounters[i])
            });

            // Fill temp variable
            currentTokenBalances = adapterBalances[i].tokenBalances;

            // Reset temp variable and counter
            nonZeroTokenBalances = new TokenBalance[](nonZeroTokensCounters[i]);
            nonZeroTokensCounters[i] = 0;

            for (uint256 j = 0; j < currentTokenBalances.length; j++) {
                // Skip if balance is not positive
                if (currentTokenBalances[j].amount == 0) {
                    continue;
                }

                // Else fill temp variable
                nonZeroTokenBalances[nonZeroTokensCounters[i]] = currentTokenBalances[j];

                // Increment counter
                nonZeroTokensCounters[i]++;
            }

            // Fill resulting variable
            nonZeroAdapterBalances[nonZeroAdaptersCounter].tokenBalances = nonZeroTokenBalances;

            // Increment counter
            nonZeroAdaptersCounter++;
        }

        return nonZeroAdapterBalances;
    }

    /**
     * @param protocolAdapterNames Array of the protocol adapters' names.
     * @param account Address of the account.
     * @return AdapterBalance array by the given parameters.
     */
    function getAdapterBalances(
        bytes32[] memory protocolAdapterNames,
        address account
    )
        public
        view
        returns (AdapterBalance[] memory)
    {
        uint256 length = protocolAdapterNames.length;
        AdapterBalance[] memory adapterBalances = new AdapterBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            adapterBalances[i] = getAdapterBalance(
                protocolAdapterNames[i],
                _protocolAdapterSupportedTokens[protocolAdapterNames[i]],
                account
            );
        }

        return adapterBalances;
    }

    /**
     * @param protocolAdapterName Protocol adapter's Name.
     * @param tokens Array of tokens' addresses.
     * @param account Address of the account.
     * @return AdapterBalance array by the given parameters.
     */
    function getAdapterBalance(
        bytes32 protocolAdapterName,
        address[] memory tokens,
        address account
    )
        public
        view
        returns (AdapterBalance memory)
    {
        address adapter = _protocolAdapterAddress[protocolAdapterName];
        require(adapter != address(0), "AR: bad protocolAdapterName!");

        TokenBalance[] memory tokenBalances = new TokenBalance[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            try ProtocolAdapter(adapter).getBalance(
                tokens[i],
                account
            ) returns (uint256 amount, bytes32 tokenAdapterName) {
                tokenBalances[i] = TokenBalance({
                    tokenAdapterName: tokenAdapterName,
                    token: tokens[i],
                    amount: amount
                });
            } catch {
                tokenBalances[i] = TokenBalance({
                    tokenAdapterName: "ERC20",
                    token: tokens[i],
                    amount: 0
                });
            }
        }

        return AdapterBalance({
            protocolAdapterName: protocolAdapterName,
            tokenBalances: tokenBalances
        });
    }

    /**
     * @dev Fills in FullTokenBalance struct for a single token.
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
