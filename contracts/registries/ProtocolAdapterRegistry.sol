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

pragma solidity 0.8.4;

import { AdapterManager } from "./AdapterManager.sol";
import { IProtocolAdapter } from "../interfaces/IProtocolAdapter.sol";
import { IProtocolAdapterRegistry } from "../interfaces/IProtocolAdapterRegistry.sol";
import { BadProtocolAdapterName } from "../shared/Errors.sol";
import { Ownable } from "../shared/Ownable.sol";
import { AdapterBalance, TokenBalance, AdapterTokens } from "../shared/Structs.sol";

/**
 * @title Registry for protocol adapters.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ProtocolAdapterRegistry is IProtocolAdapterRegistry, Ownable, AdapterManager {
    /**
     * @param adaptersTokens Array of the protocol adapters' names and tokens.
     * @param account Address of the account.
     * @return AdapterBalance array by the given parameters.
     */
    function getAdapterBalances(AdapterTokens[] calldata adaptersTokens, address account)
        external
        override
        returns (AdapterBalance[] memory)
    {
        uint256 length = adaptersTokens.length;
        AdapterBalance[] memory adapterBalances = new AdapterBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            adapterBalances[i] = getAdapterBalance(adaptersTokens[i], account);
        }

        return adapterBalances;
    }

    /**
     * @param adaptersTokens Array of the protocol adapters' names and tokens.
     * @param account Address of the account.
     * @return AdapterBalance array by the given parameters with non-zero token balances.
     */
    function getNonZeroAdapterBalances(AdapterTokens[] calldata adaptersTokens, address account)
        external
        override
        returns (AdapterBalance[] memory)
    {
        uint256 length = adaptersTokens.length;
        AdapterBalance[] memory adapterBalances = new AdapterBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            adapterBalances[i] = getNonZeroAdapterBalance(adaptersTokens[i], account);
        }

        return
            getNonZeroAdapterBalances(
                adapterBalances,
                getNonZeroAdapterBalancesNumber(adapterBalances)
            );
    }

    /**
     * @param adapterTokens Protocol adapter's name and tokens.
     * @param account Address of the account.
     * @return AdapterBalance by the given parameters.
     */
    function getAdapterBalance(AdapterTokens calldata adapterTokens, address account)
        public
        override
        returns (AdapterBalance memory)
    {
        address adapter = getAdapterAddress(adapterTokens.name);
        if (adapter == address(0)) {
            revert BadProtocolAdapterName(adapterTokens.name);
        }

        TokenBalance[] memory tokenBalances =
            getTokenBalances(adapter, adapterTokens.tokens, account);

        return AdapterBalance({ name: adapterTokens.name, tokenBalances: tokenBalances });
    }

    /**
     * @param adapterTokens Protocol adapter's name and tokens.
     * @param account Address of the account.
     * @return AdapterBalance by the given parameters with non-zero token balances.
     */
    function getNonZeroAdapterBalance(AdapterTokens calldata adapterTokens, address account)
        public
        override
        returns (AdapterBalance memory)
    {
        address adapter = getAdapterAddress(adapterTokens.name);
        if (adapter == address(0)) {
            revert BadProtocolAdapterName(adapterTokens.name);
        }

        TokenBalance[] memory tokenBalances =
            getTokenBalances(adapter, adapterTokens.tokens, account);

        return
            AdapterBalance({
                name: adapterTokens.name,
                tokenBalances: getNonZeroTokenBalances(
                    tokenBalances,
                    getNonZeroTokenBalancesNumber(tokenBalances)
                )
            });
    }

    /**
     * @param adapter Address of the protocol adapter.
     * @param tokens Array of the tokens to get balance of.
     * @param account Address of the account.
     * @return tokenBalances Array of TokenBalance structs.
     */
    function getTokenBalances(
        address adapter,
        address[] calldata tokens,
        address account
    ) internal returns (TokenBalance[] memory tokenBalances) {
        uint256 length = tokens.length;
        tokenBalances = new TokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            address token = tokens[i];
            try IProtocolAdapter(adapter).getBalance(token, account) returns (int256 amount) {
                tokenBalances[i] = TokenBalance({ token: token, amount: amount });
            } catch {
                tokenBalances[i] = TokenBalance({ token: token, amount: 0 });
            }
        }

        return tokenBalances;
    }

    /**
     * @param adapterBalances Array of AdapterBalance structs.
     * @param nonZeroAdapterBalancesNumber Number of non-zero AdapterBalance structs.
     * @return nonZeroAdapterBalances Array of non-zero AdapterBalance structs.
     */
    function getNonZeroAdapterBalances(
        AdapterBalance[] memory adapterBalances,
        uint256 nonZeroAdapterBalancesNumber
    ) internal pure returns (AdapterBalance[] memory nonZeroAdapterBalances) {
        nonZeroAdapterBalances = new AdapterBalance[](nonZeroAdapterBalancesNumber);
        uint256 length = adapterBalances.length;
        uint256 counter = 0;

        for (uint256 i = 0; i < length; i++) {
            if (adapterBalances[i].tokenBalances.length == 0) {
                continue;
            }

            nonZeroAdapterBalances[counter] = adapterBalances[i];

            counter++;
        }

        return nonZeroAdapterBalances;
    }

    /**
     * @param tokenBalances Array of TokenBalance structs.
     * @param nonZeroTokenBalancesNumber Number of non-zero TokenBalance structs.
     * @return nonZeroTokenBalances Array of on-zero TokenBalance structs.
     */
    function getNonZeroTokenBalances(
        TokenBalance[] memory tokenBalances,
        uint256 nonZeroTokenBalancesNumber
    ) internal pure returns (TokenBalance[] memory nonZeroTokenBalances) {
        nonZeroTokenBalances = new TokenBalance[](nonZeroTokenBalancesNumber);
        uint256 length = tokenBalances.length;
        uint256 counter = 0;

        for (uint256 i = 0; i < length; i++) {
            if (tokenBalances[i].amount == 0) {
                continue;
            }

            nonZeroTokenBalances[counter] = tokenBalances[i];

            counter++;
        }

        return nonZeroTokenBalances;
    }

    /**
     * @param adapterBalances List of AdapterBalance structs.
     * @return Number of non-zero AdapterBalance structs.
     */
    function getNonZeroAdapterBalancesNumber(AdapterBalance[] memory adapterBalances)
        internal
        pure
        returns (uint256)
    {
        uint256 length = adapterBalances.length;
        uint256 nonZeroTokenBalancesNumber = 0;

        for (uint256 i = 0; i < length; i++) {
            if (adapterBalances[i].tokenBalances.length > 0) {
                nonZeroTokenBalancesNumber++;
            }
        }

        return nonZeroTokenBalancesNumber;
    }

    /**
     * @param tokenBalances List of TokenBalance structs.
     * @return Number of non-zero TokenBalance structs.
     */
    function getNonZeroTokenBalancesNumber(TokenBalance[] memory tokenBalances)
        internal
        pure
        returns (uint256)
    {
        uint256 length = tokenBalances.length;
        uint256 nonZeroTokenBalancesNumber = 0;

        for (uint256 i = 0; i < length; i++) {
            if (tokenBalances[i].amount > 0) {
                nonZeroTokenBalancesNumber++;
            }
        }

        return nonZeroTokenBalancesNumber;
    }
}
