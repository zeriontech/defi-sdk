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

pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../adapters/ProtocolAdapter.sol";


/**
 * @title Interactive protocol adapter interface.
 * @dev deposit() and withdraw() functions MUST be implemented
 * as well as all the functions from ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
interface InteractiveAdapter is ProtocolAdapter {

    /**
     * @dev The function must deposit assets to the protocol.
     * @return MUST return assets to be sent back to the `msg.sender`.
     */
    function deposit(
        address[] calldata assets,
        uint256[] calldata amounts,
        bytes calldata data
    )
        external
        payable
        returns (address[] memory);

    /**
     * @dev The function must withdraw assets from the protocol.
     * @return MUST return assets to be sent back to the `msg.sender`.
     */
    function withdraw(
        address[] calldata assets,
        uint256[] calldata amounts,
        bytes calldata data
    )
        external
        payable
        returns (address[] memory);
}
