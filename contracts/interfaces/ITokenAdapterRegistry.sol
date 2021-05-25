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

import { FullTokenBalance, TokenBalance } from "../shared/Structs.sol";

/**
 * @title Registry for token adapters.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
interface ITokenAdapterRegistry {
    /**
     * @notice Fills in FullTokenBalance structs with underlying tokens.
     * @param tokenBalances Array of TokenBalance structs consisting of
     *     token addresses and absolute amounts.
     * @return fullTokenBalances Array of FullTokenBalance structs
     *     with 'closest' underlying tokens.
     */
    function getFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        returns (FullTokenBalance[] memory fullTokenBalances);

    /**
     * @notice Fills in FullTokenBalance structs with final underlying tokens.
     * @param tokenBalances Array of TokenBalance structs consisting of
     *     token addresses and absolute amounts.
     * @return finalFullTokenBalances Array of FullTokenBalance structs
     *     with 'deepest' underlying tokens.
     */
    function getFinalFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        returns (FullTokenBalance[] memory finalFullTokenBalances);

    /**
     * @notice Fills in FullTokenBalance structs with underlying tokens.
     * @dev Amount is considered to be 10 ** decimals.
     * @param tokens Array of token addresses.
     * @return fullTokenBalances Array of FullTokenBalance structs
     *     with 'closest' underlying tokens.
     */
    function getFullTokenBalances(address[] calldata tokens)
        external
        returns (FullTokenBalance[] memory fullTokenBalances);

    /**
     * @notice Fills in FullTokenBalance structs with final underlying tokens.
     * @dev Amount is considered to be 10 ** decimals.
     * @param tokens Array of token addresses.
     * @return finalFullTokenBalances Array of FullTokenBalance structs
     *     with 'deepest' underlying tokens.
     */
    function getFinalFullTokenBalances(address[] calldata tokens)
        external
        returns (FullTokenBalance[] memory finalFullTokenBalances);
}
