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

import {
    ProtocolBalance,
    ProtocolMetadata,
    AdapterBalance,
    AdapterMetadata,
    FullTokenBalance,
    TokenBalance,
    TokenMetadata,
    Component
} from "./Structs.sol";
import { Strings } from "./Strings.sol";
import { Ownable } from "./Ownable.sol";
import { ProtocolManager } from "./ProtocolManager.sol";
import { TokenAdapterManager } from "./TokenAdapterManager.sol";
import { ProtocolAdapter } from "./adapters/ProtocolAdapter.sol";
import { TokenAdapter } from "./adapters/TokenAdapter.sol";


/**
 * @title Registry for protocols, adapters, and token adapters.
 * @notice getBalances() function implements the main functionality.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AdapterRegistry is Ownable, ProtocolManager, TokenAdapterManager {

    using Strings for string;

    /**
     * @param tokenType String with type of the token.
     * @param token Address of the token.
     * @return Full token balance by token type and token address.
     */
    function getFullTokenBalance(
        string calldata tokenType,
        address token
    )
        external
        view
        returns (FullTokenBalance memory)
    {
        Component[] memory components = getComponents(tokenType, token, 1e18);
        return getFullTokenBalance(tokenType, token, 1e18, components);
    }

    /**
     * @param tokenType String with type of the token.
     * @param token Address of the token.
     * @return Final full token balance by token type and token address.
     */
    function getFinalFullTokenBalance(
        string calldata tokenType,
        address token
    )
        external
        view
        returns (FullTokenBalance memory)
    {
        Component[] memory finalComponents = getFinalComponents(tokenType, token, 1e18);
        return getFullTokenBalance(tokenType, token, 1e18, finalComponents);
    }

    /**
     * @param account Address of the account.
     * @return ProtocolBalance array by the given account.
     */
    function getBalances(
        address account
    )
        external
        view
        returns (ProtocolBalance[] memory)
    {
        string[] memory protocolNames = getProtocolNames();

        return getProtocolBalances(account, protocolNames);
    }

    /**
     * @param account Address of the account.
     * @param protocolNames Array of the protocols' names.
     * @return ProtocolBalance array by the given account and names of protocols.
     */
    function getProtocolBalances(
        address account,
        string[] memory protocolNames
    )
        public
        view
        returns (ProtocolBalance[] memory)
    {
        ProtocolBalance[] memory protocolBalances = new ProtocolBalance[](protocolNames.length);
        uint256 counter = 0;

        for (uint256 i = 0; i < protocolNames.length; i++) {
            protocolBalances[i] = ProtocolBalance({
                metadata: protocolMetadata[protocolNames[i]],
                adapterBalances: getAdapterBalances(account, protocolAdapters[protocolNames[i]])
            });
            if (protocolBalances[i].adapterBalances.length > 0) {
                counter++;
            }
        }

        ProtocolBalance[] memory nonZeroProtocolBalances = new ProtocolBalance[](counter);
        counter = 0;

        for (uint256 i = 0; i < protocolNames.length; i++) {
            if (protocolBalances[i].adapterBalances.length > 0) {
                nonZeroProtocolBalances[counter] = protocolBalances[i];
                counter++;
            }
        }

        return nonZeroProtocolBalances;
    }

    /**
     * @param account Address of the account.
     * @param adapters Array of the protocol adapters' addresses.
     * @return AdapterBalance array by the given parameters.
     */
    function getAdapterBalances(
        address account,
        address[] memory adapters
    )
        public
        view
        returns (AdapterBalance[] memory)
    {
        AdapterBalance[] memory adapterBalances = new AdapterBalance[](adapters.length);
        uint256 counter = 0;

        for (uint256 i = 0; i < adapterBalances.length; i++) {
            adapterBalances[i] = getAdapterBalance(
                account,
                adapters[i],
                supportedTokens[adapters[i]]
            );
            if (adapterBalances[i].balances.length > 0) {
                counter++;
            }
        }

        AdapterBalance[] memory nonZeroAdapterBalances = new AdapterBalance[](counter);
        counter = 0;

        for (uint256 i = 0; i < adapterBalances.length; i++) {
            if (adapterBalances[i].balances.length > 0) {
                nonZeroAdapterBalances[counter] = adapterBalances[i];
                counter++;
            }
        }

        return nonZeroAdapterBalances;
    }

    /**
     * @param account Address of the account.
     * @param adapter Address of the protocol adapter.
     * @param tokens Array with tokens' addresses.
     * @return AdapterBalance array by the given parameters.
     */
    function getAdapterBalance(
        address account,
        address adapter,
        address[] memory tokens
    )
        public
        view
        returns (AdapterBalance memory)
    {
        string memory tokenType = ProtocolAdapter(adapter).tokenType();
        uint256[] memory amounts = new uint256[](tokens.length);
        uint256 counter;

        for (uint256 i = 0; i < amounts.length; i++) {
            try ProtocolAdapter(adapter).getBalance(tokens[i], account) returns (uint256 result) {
                amounts[i] = result;
            } catch {
                amounts[i] = 0;
            }
            if (amounts[i] > 0) {
                counter++;
            }
        }

        FullTokenBalance[] memory finalFullTokenBalances = new FullTokenBalance[](counter);
        counter = 0;

        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] > 0) {
                finalFullTokenBalances[counter] = getFullTokenBalance(
                    tokenType,
                    tokens[i],
                    amounts[i],
                    getFinalComponents(tokenType, tokens[i], amounts[i])
                );
                counter++;
            }
        }

        return AdapterBalance({
            metadata: AdapterMetadata({
                adapterAddress: adapter,
                adapterType: ProtocolAdapter(adapter).adapterType()
            }),
            balances: finalFullTokenBalances
        });
    }

    /**
     * @param tokenType Type of the base token.
     * @param token Address of the base token.
     * @param amount Amount of the base token.
     * @param components Components of the base token.
     * @return FullTokenBalance struct by the given components.
     */
    function getFullTokenBalance(
        string memory tokenType,
        address token,
        uint256 amount,
        Component[] memory components
    )
        internal
        view
        returns (FullTokenBalance memory)
    {
        TokenBalance[] memory componentTokenBalances = new TokenBalance[](components.length);

        for (uint256 i = 0; i < components.length; i++) {
            componentTokenBalances[i] = getTokenBalance(
                components[i].tokenType,
                components[i].token,
                components[i].rate
            );
        }

        return FullTokenBalance({
            base: getTokenBalance(tokenType, token, amount),
            underlying: componentTokenBalances
        });
    }

    /**
     * @param tokenType String with type of the token.
     * @param token Address of the token.
     * @param amount Amount of the token.
     * @return Final components by token type and token address.
     */
    function getFinalComponents(
        string memory tokenType,
        address token,
        uint256 amount
    )
        internal
        view
        returns (Component[] memory)
    {
        uint256 totalLength = getFinalComponentsNumber(tokenType, token, true);
        Component[] memory finalTokens = new Component[](totalLength);
        uint256 length;
        uint256 init = 0;

        Component[] memory components = getComponents(tokenType, token, amount);
        Component[] memory finalComponents;

        for (uint256 i = 0; i < components.length; i++) {
            finalComponents = getFinalComponents(
                components[i].tokenType,
                components[i].token,
                components[i].rate
            );

            length = finalComponents.length;

            if (length == 0) {
                finalTokens[init] = components[i];
                init = init + 1;
            } else {
                for (uint256 j = 0; j < length; j++) {
                    finalTokens[init + j] = finalComponents[j];
                }

                init = init + length;
            }
        }

        return finalTokens;
    }

    /**
     * @param tokenType String with type of the token.
     * @param token Address of the token.
     * @param initial Whether the function call is initial or recursive.
     * @return Final tokens number by token type and token.
     */
    function getFinalComponentsNumber(
        string memory tokenType,
        address token,
        bool initial
    )
        internal
        view
        returns (uint256)
    {
        uint256 totalLength = 0;
        Component[] memory components = getComponents(tokenType, token, 1e18);

        if (components.length == 0) {
            return initial ? uint256(0) : uint256(1);
        }

        for (uint256 i = 0; i < components.length; i++) {
            totalLength = totalLength + getFinalComponentsNumber(
                components[i].tokenType,
                components[i].token,
                false
            );
        }

        return totalLength;
    }

    /**
     * @param tokenType String with type of the token.
     * @param token Address of the token.
     * @param amount Amount of the token.
     * @return Components by token type and token address.
     */
    function getComponents(
        string memory tokenType,
        address token,
        uint256 amount
    )
        internal
        view
        returns (Component[] memory)
    {
        TokenAdapter adapter = TokenAdapter(tokenAdapter[tokenType]);
        Component[] memory components;

        if (address(adapter) != address(0)) {
            try adapter.getComponents(token) returns (Component[] memory result) {
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
     * @param tokenType String with type of the token.
     * @param token Address of the token.
     * @param amount Amount of tokens.
     * @return TokenBalance struct with token info and balance.
     */
    function getTokenBalance(
        string memory tokenType,
        address token,
        uint256 amount
    )
        internal
        view
        returns (TokenBalance memory)
    {
        TokenAdapter adapter = TokenAdapter(tokenAdapter[tokenType]);
        TokenBalance memory tokenBalance;
        tokenBalance.amount = amount;

        if (address(adapter) != address(0)) {
            try adapter.getMetadata(token) returns (TokenMetadata memory result) {
                tokenBalance.metadata = result;
            } catch {
                tokenBalance.metadata = TokenMetadata({
                    token: token,
                    name: "Not available",
                    symbol: "N/A",
                    decimals: 0
                });
            }
        } else {
            tokenBalance.metadata = TokenMetadata({
                token: token,
                name: "Not available",
                symbol: "N/A",
                decimals: 0
            });
        }

        return tokenBalance;
    }
}
