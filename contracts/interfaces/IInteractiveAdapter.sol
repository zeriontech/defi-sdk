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

pragma solidity 0.8.1;

import { TokenAmount } from "../shared/Structs.sol";

/**
 * @title Interface for interactive protocol adapters.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
interface IInteractiveAdapter {
    /**
     * @dev Deposits assets to the protocol.
     * @param tokenAmounts Array of TokenAmount structs for the tokens used in deposit action.
     * @param data ABI-encoded additional parameters.
     * @return tokensToBeWithdrawn Array of tokens to be returned to the account.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        returns (address[] memory);

    /**
     * @dev Withdraws assets from the protocol.
     * @param tokenAmounts Array of TokenAmount structs for the tokens used in withdraw action.
     * @param data ABI-encoded additional parameters.
     * @return tokensToBeWithdrawn Array of tokens to be returned to the account.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        returns (address[] memory tokensToBeWithdrawn);
}
