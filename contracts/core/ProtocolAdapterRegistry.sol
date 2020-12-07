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

import { AdapterBalance, TokenBalance } from "../shared/Structs.sol";
import { ERC20 } from "../shared/ERC20.sol";
import { Ownable } from "./Ownable.sol";
import { ProtocolAdapterManager } from "./ProtocolAdapterManager.sol";
import { ProtocolAdapter } from "../adapters/ProtocolAdapter.sol";

/**
 * @title Registry for protocol adapters.
 * @notice getBalances() function implements the main functionality.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ProtocolAdapterRegistry is Ownable, ProtocolAdapterManager {
    /**
     * @param account Address of the account.
     * @return AdapterBalance array by the given account.
     * @notice Zero values are filtered out!
     */
    function getBalances(address account) external returns (AdapterBalance[] memory) {
        AdapterBalance[] memory adapterBalances =
            getAdapterBalances(getProtocolAdapterNames(), account);

        (uint256 nonZeroAdapterBalancesNumber, uint256[] memory nonZeroTokenBalancesNumbers) =
            getNonZeroAdapterBalancesAndTokenBalancesNumbers(adapterBalances);

        return
            getNonZeroAdapterBalances(
                adapterBalances,
                nonZeroAdapterBalancesNumber,
                nonZeroTokenBalancesNumbers
            );
    }

    /**
     * @param protocolAdapterNames Array of the protocol adapters' names.
     * @param account Address of the account.
     * @return AdapterBalance array by the given parameters.
     */
    function getAdapterBalances(bytes32[] memory protocolAdapterNames, address account)
        public
        returns (AdapterBalance[] memory)
    {
        uint256 length = protocolAdapterNames.length;
        AdapterBalance[] memory adapterBalances = new AdapterBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            adapterBalances[i] = getAdapterBalance(
                protocolAdapterNames[i],
                getSupportedTokens(protocolAdapterNames[i]),
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
    ) public returns (AdapterBalance memory) {
        address adapter = getProtocolAdapterAddress(protocolAdapterName);
        require(adapter != address(0), "AR: bad protocolAdapterName");

        uint256 length = tokens.length;
        TokenBalance[] memory tokenBalances = new TokenBalance[](tokens.length);

        for (uint256 i = 0; i < length; i++) {
            try ProtocolAdapter(adapter).getBalance(tokens[i], account) returns (int256 amount) {
                tokenBalances[i] = TokenBalance({ token: tokens[i], amount: amount });
            } catch {
                tokenBalances[i] = TokenBalance({ token: tokens[i], amount: 0 });
            }
        }

        return
            AdapterBalance({
                protocolAdapterName: protocolAdapterName,
                tokenBalances: tokenBalances
            });
    }

    /**
     * @param adapterBalances List of AdapterBalance structs.
     * @return Numbers of non-empty AdapterBalance and non-zero TokenBalance structs.
     */
    function getNonZeroAdapterBalancesAndTokenBalancesNumbers(
        AdapterBalance[] memory adapterBalances
    ) internal returns (uint256, uint256[] memory) {
        uint256 length = adapterBalances.length;
        uint256 nonZeroAdapterBalancesNumber = 0;
        uint256[] memory nonZeroTokenBalancesNumbers = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            nonZeroTokenBalancesNumbers[i] = getNonZeroTokenBalancesNumber(
                adapterBalances[i].tokenBalances
            );

            if (nonZeroTokenBalancesNumbers[i] > 0) {
                nonZeroAdapterBalancesNumber++;
            }
        }

        return (nonZeroAdapterBalancesNumber, nonZeroTokenBalancesNumbers);
    }

    /**
     * @param tokenBalances List of TokenBalance structs.
     * @return Number of non-zero TokenBalance structs.
     */
    function getNonZeroTokenBalancesNumber(TokenBalance[] memory tokenBalances)
        internal
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

    /**
     * @param adapterBalances List of AdapterBalance structs.
     * @param nonZeroAdapterBalancesNumber Number of non-empty AdapterBalance structs.
     * @param nonZeroTokenBalancesNumbers List of non-zero TokenBalance structs numbers.
     * @return Non-empty AdapterBalance structs with non-zero TokenBalance structs.
     */
    function getNonZeroAdapterBalances(
        AdapterBalance[] memory adapterBalances,
        uint256 nonZeroAdapterBalancesNumber,
        uint256[] memory nonZeroTokenBalancesNumbers
    ) internal returns (AdapterBalance[] memory) {
        AdapterBalance[] memory nonZeroAdapterBalances =
            new AdapterBalance[](nonZeroAdapterBalancesNumber);
        uint256 length = adapterBalances.length;
        uint256 counter = 0;

        for (uint256 i = 0; i < length; i++) {
            if (nonZeroTokenBalancesNumbers[i] == 0) {
                continue;
            }

            nonZeroAdapterBalances[counter] = AdapterBalance({
                protocolAdapterName: adapterBalances[i].protocolAdapterName,
                tokenBalances: getNonZeroTokenBalances(
                    adapterBalances[i].tokenBalances,
                    nonZeroTokenBalancesNumbers[i]
                )
            });

            counter++;
        }

        return nonZeroAdapterBalances;
    }

    /**
     * @param tokenBalances List of TokenBalance structs.
     * @param nonZeroTokenBalancesNumber Number of non-zero TokenBalance structs.
     * @return Non-zero TokenBalance structs.
     */
    function getNonZeroTokenBalances(
        TokenBalance[] memory tokenBalances,
        uint256 nonZeroTokenBalancesNumber
    ) internal returns (TokenBalance[] memory) {
        TokenBalance[] memory nonZeroTokenBalances =
            new TokenBalance[](nonZeroTokenBalancesNumber);
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
}
