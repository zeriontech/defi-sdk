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

/**
 * @dev Exchange contract interface.
 * The Exchange contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy.
 */
interface Exchange {
    function ethToTokenSwapInput(uint256, uint256) external payable returns (uint256);

    function tokenToEthSwapInput(
        uint256,
        uint256,
        uint256
    ) external returns (uint256);

    function tokenToTokenSwapInput(
        uint256,
        uint256,
        uint256,
        uint256,
        address
    ) external returns (uint256);

    function ethToTokenSwapOutput(uint256, uint256) external payable returns (uint256);

    function tokenToEthSwapOutput(
        uint256,
        uint256,
        uint256
    ) external returns (uint256);

    function tokenToTokenSwapOutput(
        uint256,
        uint256,
        uint256,
        uint256,
        address
    ) external returns (uint256);

    function addLiquidity(
        uint256,
        uint256,
        uint256
    ) external payable returns (uint256);

    function removeLiquidity(
        uint256,
        uint256,
        uint256,
        uint256
    ) external returns (uint256, uint256);

    function name() external view returns (bytes32);

    function symbol() external view returns (bytes32);

    function decimals() external view returns (uint256);
}
