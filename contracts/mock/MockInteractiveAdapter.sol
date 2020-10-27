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

import { TokenAmount } from "../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../interactiveAdapters/InteractiveAdapter.sol";

/**
 * @title Mock interactive adapter.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract MockInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Mock deposit function.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = ETH;
    }

    /**
     * @notice Mock withdraw function.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = WETH;
    }
}
