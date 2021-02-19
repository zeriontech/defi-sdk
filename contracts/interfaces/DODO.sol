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

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

/**
 * @dev DODO contract interface.
 * Only the functions required for DodoTokenAdapter contract are added.
 * The DODO contract is available here
 * github.com/DODOEX/dodo-smart-contract/blob/master/contracts/dodo.sol.
 */
interface DODO {
    function depositBase(uint256) external returns (uint256);

    function depositQuote(uint256) external returns (uint256);

    function withdrawBase(uint256) external returns (uint256);

    function withdrawQuote(uint256) external returns (uint256);

    function withdrawAllBase() external returns (uint256);

    function withdrawAllQuote() external returns (uint256);

    // solhint-disable func-name-mixedcase
    function _BASE_TOKEN_() external view returns (address);

    function _BASE_CAPITAL_TOKEN_() external view returns (address);

    function _QUOTE_TOKEN_() external view returns (address);

    // solhint-enable func-name-mixedcase

    function getExpectedTarget() external view returns (uint256, uint256);

    function getTotalBaseCapital() external view returns (uint256);

    function getTotalQuoteCapital() external view returns (uint256);
}
