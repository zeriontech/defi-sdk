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

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import { ITokenAdapter } from "../interfaces/ITokenAdapter.sol";
import { ERC20Metadata, TokenBalance } from "../shared/Structs.sol";

/**
 * @title Token adapter abstract contract.
 * @dev getUnderlyingTokenBalances() function MUST be implemented.
 * getName(), getSymbol(), getDecimals() functions or getMetadata() function may be overridden.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapter is ITokenAdapter {
    /**
     * @dev MUST return array of TokenBalance structs with underlying tokens balances
     *     for the given TokenBalance struct consisting of token address and absolute balance.
     * @param tokenBalance TokenBalance struct with token info to get underlying token balances for.
     * @return underlyingTokenBalances Array of TokenBalance structs with underlying token balances.
     */
    function getUnderlyingTokenBalances(TokenBalance memory tokenBalance)
        external
        virtual
        override
        returns (TokenBalance[] memory underlyingTokenBalances);

    /**
     * @dev It is recommended to override getName(), getSymbol(), and getDecimals() functions.
     * @param tokenBalance TokenBalance struct with token info to get metadata for.
     * @return metadata ERC20Metadata struct with IERC20-style token info.
     */
    function getMetadata(TokenBalance memory tokenBalance)
        external
        view
        virtual
        override
        returns (ERC20Metadata memory metadata)
    {
        return
            ERC20Metadata({
                name: getName(tokenBalance.token),
                symbol: getSymbol(tokenBalance.token),
                decimals: getDecimals(tokenBalance.token)
            });
    }

    /**
     * @return name String that will be treated like token name.
     */
    function getName(address token) internal view virtual returns (string memory name) {
        return ERC20(token).name();
    }

    /**
     * @return symbol String that will be treated like token symbol.
     */
    function getSymbol(address token) internal view virtual returns (string memory symbol) {
        return ERC20(token).symbol();
    }

    /**
     * @return decimals Number (of uint8 type) that will be treated like token decimals.
     */
    function getDecimals(address token) internal view virtual returns (uint8 decimals) {
        return ERC20(token).decimals();
    }
}
