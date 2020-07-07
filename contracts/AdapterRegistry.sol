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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import {
    AdapterBalance,
    AdapterMetadata,
    FullTokenBalance,
    TokenBalance,
    TokenMetadata,
    ERC20Metadata,
    Component
} from "./Structs.sol";
import { Ownable } from "./Ownable.sol";
import { ProtocolAdapterManager } from "./ProtocolAdapterManager.sol";
import { TokenAdapterManager } from "./TokenAdapterManager.sol";
import { ProtocolAdapter } from "./adapters/ProtocolAdapter.sol";
import { TokenAdapter } from "./adapters/TokenAdapter.sol";


/**
 * @title Registry for protocols, adapters, and token adapters.
 * @notice getBalances() function implements the main functionality.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AdapterRegistry is Ownable, ProtocolAdapterManager, TokenAdapterManager {

    /**
     * @param tokenAddresses Array of tokens' addresses.
     * @param tokenAdapterNames Array of tokens' types.
     * @return Full token balances by token types and token addresses.
     */
    function getFullTokenBalances(
        address[] calldata tokenAddresses,
        bytes32[] calldata tokenAdapterNames
    )
        external
        view
        returns (FullTokenBalance[] memory)
    {
        uint256 length = tokenAddresses.length;
        require(length == tokenAdapterNames.length, "AR: inconsistent arrays!");

        FullTokenBalance[] memory fullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            fullTokenBalances[i] = getFullTokenBalance(
                tokenAddresses[i],
                tokenAdapterNames[i],
                1e18
            );
        }

        return fullTokenBalances;
    }

    /**
     * @param account Address of the account.
     * @return AdapterBalance array by the given account.
     */
    function getBalances(
        address account
    )
        external
        view
        returns (AdapterBalance[] memory)
    {
        return getAdapterBalances(account, _protocolAdapterNames);
    }

    /**
     * @param account Address of the account.
     * @param protocolAdapterNames Array of the protocol adapters' addresses.
     * @return AdapterBalance array by the given parameters. Zero values are filtered out!
     */
    function getAdapterBalances(
        address account,
        bytes32[] memory protocolAdapterNames
    )
        public
        view
        returns (AdapterBalance[] memory)
    {
        uint256 length = protocolAdapterNames.length;
        AdapterBalance[] memory adapterBalances = new AdapterBalance[](length);
        uint256 counter = 0;

        for (uint256 i = 0; i < length; i++) {
            adapterBalances[i] = getAdapterBalance(
                account,
                protocolAdapterNames[i],
                _protocolAdapterSupportedTokens[protocolAdapterNames[i]]
            );
            if (adapterBalances[i].balances.length > 0) {
                counter++;
            }
        }

        AdapterBalance[] memory nonZeroAdapterBalances = new AdapterBalance[](counter);
        counter = 0;

        for (uint256 i = 0; i < length; i++) {
            if (adapterBalances[i].balances.length > 0) {
                nonZeroAdapterBalances[counter] = adapterBalances[i];
                counter++;
            }
        }

        return nonZeroAdapterBalances;
    }

    /**
     * @param account Address of the account.
     * @param protocolAdapterName Address of the protocol adapter.
     * @param tokens Array of tokens' addresses.
     * @return AdapterBalance array by the given parameters. Zero values are filtered out!
     */
    function getAdapterBalance(
        address account,
        bytes32 protocolAdapterName,
        address[] memory tokens
    )
        public
        view
        returns (AdapterBalance memory)
    {
        address adapter = _protocolAdapterAddress[protocolAdapterName];
        require(adapter != address(0), "AR: bad protocolAdapterName!");
        uint256[] memory amounts = new uint256[](tokens.length);
        bytes32[] memory tokenAdapterNames = new bytes32[](tokens.length);
        uint256 counter;

        for (uint256 i = 0; i < tokens.length; i++) {
            try ProtocolAdapter(adapter).getBalance(
                tokens[i],
                account
            ) returns (uint256 amount, bytes32 tokenAdapterName) {
                amounts[i] = amount;
                tokenAdapterNames[i] = tokenAdapterName;
            } catch {
                amounts[i] = 0;
                tokenAdapterNames[i] = "ERC20";
            }
            if (amounts[i] > 0) {
                counter++;
            }
        }

        TokenBalance[] memory nonZeroTokenBalances = new TokenBalance[](counter);
        counter = 0;

        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] > 0) {
                nonZeroTokenBalances[counter] = getTokenBalance(
                    tokens[i],
                    tokenAdapterNames[i],
                    amounts[i]
                );
                counter++;
            }
        }

        return AdapterBalance({
            metadata: AdapterMetadata({
                adapterName: protocolAdapterName,
                adapterType: ProtocolAdapter(adapter).adapterType()
            }),
            balances: nonZeroTokenBalances
        });
    }

    /**
     * @param tokenAddress Address of the base token.
     * @param tokenAdapterName Type of the base token.
     * @param amount Amount of the base token.
     * @return FullTokenBalance struct by the given components.
     */
    function getFullTokenBalance(
        address tokenAddress,
        bytes32 tokenAdapterName,
        uint256 amount
    )
        internal
        view
        returns (FullTokenBalance memory)
    {
        Component[] memory components = getComponents(tokenAddress, tokenAdapterName, amount);
        TokenBalance[] memory componentTokenBalances = new TokenBalance[](components.length);

        for (uint256 i = 0; i < components.length; i++) {
            componentTokenBalances[i] = getTokenBalance(
                components[i].tokenAddress,
                components[i].tokenType,
                components[i].rate
            );
        }

        return FullTokenBalance({
            base: getTokenBalance(tokenAddress, tokenAdapterName, amount),
            underlying: componentTokenBalances
        });
    }

    /**
     * @param tokenAddress Address of the token.
     * @param tokenAdapterName Type of the token.
     * @param amount Amount of the token.
     * @return Components by token type and token address.
     */
    function getComponents(
        address tokenAddress,
        bytes32 tokenAdapterName,
        uint256 amount
    )
        internal
        view
        returns (Component[] memory)
    {
        TokenAdapter tokenAdapter = TokenAdapter(_tokenAdapterAddress[tokenAdapterName]);
        Component[] memory components;

        if (address(tokenAdapter) != address(0)) {
            try tokenAdapter.getComponents(tokenAddress) returns (Component[] memory result) {
                components = result;
            } catch {
                components = new Component[](0);
            }
        } else {
            components = new Component[](0);
        }

        for (uint256 i = 0; i < components.length; i++) {
            components[i].rate = components[i].rate * amount / 1e18;
        }

        return components;
    }

    /**
     * @notice Fulfills TokenBalance struct using type, address, and balance of the token.
     * @param tokenAddress Address of the token.
     * @param tokenAdapterName Type of the token.
     * @param amount Amount of tokens.
     * @return TokenBalance struct with token info and balance.
     */
    function getTokenBalance(
        address tokenAddress,
        bytes32 tokenAdapterName,
        uint256 amount
    )
        internal
        view
        returns (TokenBalance memory)
    {
        TokenAdapter tokenAdapter = TokenAdapter(_tokenAdapterAddress[tokenAdapterName]);
        TokenBalance memory tokenBalance;
        tokenBalance.amount = amount;

        if (address(tokenAdapter) != address(0)) {
            try tokenAdapter.getMetadata(
                tokenAddress
            )
                returns (ERC20Metadata memory erc20)
            {
                tokenBalance.metadata = TokenMetadata({
                    tokenAddress: tokenAddress,
                    tokenType: tokenAdapterName,
                    erc20: erc20
                });
            } catch {
                tokenBalance.metadata = TokenMetadata({
                    tokenAddress: tokenAddress,
                    tokenType: tokenAdapterName,
                    erc20: ERC20Metadata({
                        name: "Not available",
                        symbol: "N/A",
                        decimals: 0
                    })
                });
            }
        } else {
            tokenBalance.metadata = TokenMetadata({
                tokenAddress: tokenAddress,
                tokenType: tokenAdapterName,
                erc20: ERC20Metadata({
                    name: "Not available",
                    symbol: "N/A",
                    decimals: 0
                })
            });
        }

        return tokenBalance;
    }
}
