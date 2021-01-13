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

abstract contract Base {
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /**
     * @dev Safe Ether transfer.
     * @param to Address to transfer Ether to.
     * @param amount Ether amount to be transferred.
     * @param error Error string to be used in require().
     */
    function transferEther(
        address to,
        uint256 amount,
        string memory error
    ) internal {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = to.call{ value: amount }(new bytes(0));
        require(success, error);
    }
}
