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

import { ITokensHandler } from "../interfaces/ITokensHandler.sol";

import { Base } from "./Base.sol";
import { Ownable } from "./Ownable.sol";

/**
 * @title Abstract contract returning tokens lost on the contract
 */
abstract contract TokensHandler is ITokensHandler, Ownable {
    receive() external payable {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @inheritdoc ITokensHandler
     */
    function returnLostTokens(address token, address payable beneficiary) external onlyOwner {
        Base.transfer(token, beneficiary, Base.getBalance(token));
    }
}
