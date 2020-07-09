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
    FullTokenBalance,
    TokenBalance,
    AdapterBalance,
    TokenBalanceWithAdapter,
    ERC20Metadata,
    Component
} from "../shared/Structs.sol";
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
            fullTokenBalances[i] = getFullTokenBalance(
                tokenAdapterNames[i],
                tokens[i],
                1e18
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
        AdapterBalance[] memory adapterBalances = getAdapterBalances(
            _protocolAdapterNames,
            account
        );
        uint256 adaptersCounter = 0;
        uint256[] memory tokensCounters = new uint256[](adapterBalances.length);


        for (uint256 i = 0; i < adapterBalances.length; i++) {
            tokensCounters[i] = 0;
            for (uint256 j = 0; j < adapterBalances[i].balances.length; j++) {
                if (adapterBalances[i].balances[j].tokenBalance.amount > 0) {
                    tokensCounters[i]++;
                }
            }
            if (tokensCounters[i] > 0) {
                adaptersCounter++;
            }
        }

        AdapterBalance[] memory nonZeroAdapterBalances = new AdapterBalance[](adaptersCounter);
        AdapterBalance memory currentAdapterBalance;
        TokenBalanceWithAdapter memory currentTokenBalances;
        adaptersCounter = 0;
        for (uint256 i = 0; i < adapterBalances.length; i++) {
            currentAdapterBalance = nonZeroAdapterBalances[adaptersCounter];
            currentAdapterBalance.protocolAdapterName = adapterBalances[i].protocolAdapterName;
            currentAdapterBalance.balances = new TokenBalanceWithAdapter[](tokensCounters[i]);
            tokensCounters[i] = 0;
            for (uint256 j = 0; j < adapterBalances[i].balances.length; j++) {
                if (adapterBalances[i].balances[j].tokenBalance.amount > 0) {
                    currentTokenBalances = currentAdapterBalance.balances[tokensCounters[i]];
                    currentTokenBalances = adapterBalances[i].balances[j];
                    tokensCounters[i]++;
                }
            }
            if (tokensCounters[i] > 0) {
                adaptersCounter++;
            }
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

        TokenBalanceWithAdapter[] memory balances = new TokenBalanceWithAdapter[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            try ProtocolAdapter(adapter).getBalance(
                tokens[i],
                account
            ) returns (uint256 amount, bytes32 tokenAdapterName) {
                balances[i] = TokenBalanceWithAdapter({
                    tokenAdapterName: tokenAdapterName,
                    tokenBalance: getTokenBalance(tokenAdapterName, tokens[i], amount)
                });
            } catch {
                balances[i] = TokenBalanceWithAdapter({
                    tokenAdapterName: "ERC20",
                    tokenBalance: getTokenBalance("ERC20", tokens[i], 0)
                });
            }
        }

        return AdapterBalance({
            protocolAdapterName: protocolAdapterName,
            balances: balances
        });
    }

    /**
     * @dev Fullfills FullTokenBalance struct for a single token.
     * @param tokenAdapterName Type of the base token.
     * @param token Address of the base token.
     * @param amount Amount of the base token.
     * @return FullTokenBalance struct by the given components.
     */
    function getFullTokenBalance(
        bytes32 tokenAdapterName,
        address token,
        uint256 amount
    )
        internal
        view
        returns (FullTokenBalance memory)
    {
        Component[] memory components = getComponents(tokenAdapterName, token, amount);
        TokenBalance[] memory componentTokenBalances = new TokenBalance[](components.length);

        for (uint256 i = 0; i < components.length; i++) {
            componentTokenBalances[i] = getTokenBalance(
                tokenAdapterName,
                components[i].token,
                components[i].rate
            );
        }

        return FullTokenBalance({
            base: getTokenBalance(tokenAdapterName, token, amount),
            underlying: componentTokenBalances
        });
    }

    /**
     * @dev Fetches internal data about underlying components.
     * @param tokenAdapterName Type of the token.
     * @param token Address of the token.
     * @param amount Amount of the token.
     * @return Components by token type and token address.
     */
    function getComponents(
        bytes32 tokenAdapterName,
        address token,
        uint256 amount
    )
        internal
        view
        returns (Component[] memory)
    {
        TokenAdapter tokenAdapter = TokenAdapter(_tokenAdapterAddress[tokenAdapterName]);
        Component[] memory components;

        if (address(tokenAdapter) != address(0)) {
            try tokenAdapter.getComponents(token) returns (Component[] memory result) {
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
     * @param tokenAdapterName Type of the token.
     * @param token Address of the token.
     * @param amount Amount of tokens.
     * @return TokenBalance struct with token info and balance.
     */
    function getTokenBalance(
        bytes32 tokenAdapterName,
        address token,
        uint256 amount
    )
        internal
        view
        returns (TokenBalance memory)
    {
        TokenAdapter tokenAdapter = TokenAdapter(_tokenAdapterAddress[tokenAdapterName]);
        ERC20Metadata memory erc20metadata;

        if (address(tokenAdapter) == address(0)) {
            erc20metadata = ERC20Metadata({
                name: "Not available",
                symbol: "N/A",
                decimals: 0
            });
        } else {
            try tokenAdapter.getMetadata(
                token
            )
                returns (ERC20Metadata memory erc20)
            {
                erc20metadata = erc20;
            } catch {
                erc20metadata = ERC20Metadata({
                    name: "Not available",
                    symbol: "N/A",
                    decimals: 0
                });
            }
        }

        return TokenBalance({
            token: token,
            amount: amount,
            erc20metadata: erc20metadata
        });
    }
}
