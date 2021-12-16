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

pragma solidity 0.8.10;

import { ERC20Metadata, TokenBalance } from "../shared/Structs.sol";

/**
 * @title Token adapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
interface ITokenAdapter {
    /**
     * @param tokenBalance TokenBalance struct with token info to get underlying token balances for
     * @return underlyingTokenBalances Array of TokenBalance structs with underlying token balances
     */
    function getUnderlyingTokenBalances(TokenBalance calldata tokenBalance)
        external
        returns (TokenBalance[] memory underlyingTokenBalances);

    /**
     * @param tokenBalance TokenBalance struct with token info to get metadata for
     * @return metadata ERC20Metadata struct with IERC20-style token info
     */
    function getMetadata(TokenBalance calldata tokenBalance)
        external
        view
        returns (ERC20Metadata memory metadata);
}
