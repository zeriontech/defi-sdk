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

import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { IAdapterManager } from "../interfaces/IAdapterManager.sol";
import { ICaller } from "../interfaces/ICaller.sol";
import { IInteractiveAdapter } from "../interfaces/IInteractiveAdapter.sol";
import { Base } from "../shared/Base.sol";
import { ActionType } from "../shared/Enums.sol";
import { ZeroCallee, ZeroOutputToken } from "../shared/Errors.sol";
import { Action, TokenAmount } from "../shared/Structs.sol";
import { TokensHandler } from "../shared/TokensHandler.sol";

/**
 * @title Simple caller that passes through any call and forwards return tokens
 */
contract SimpleCaller is ICaller, TokensHandler {
    /**
     * @notice Main external function: decodes callerCallData,
     *     executes external call, and returns tokens to `msg.sender` (i.e. Router contract)
     * @param callerCallData ABI-encoded parameters:
     *     - callee Address to forward the external call to
     *     - callData Call data to be used in the external call
     *     - returnToken Address of the token that should be returned
     * @dev `callee` and `returnToken` cannot be `address(0)`
     */
    function callBytes(bytes calldata callerCallData) external payable override {
        (address payable callee, bytes memory callData, address returnToken) = abi.decode(
            callerCallData,
            (address, bytes, address)
        );
        if (returnToken == address(0)) revert ZeroOutputToken();
        if (callee == address(0)) revert ZeroCallee();

        Address.functionCallWithValue(callee, callData, msg.value, "SC: call failed w/ no reason");

        Base.transfer(returnToken, msg.sender, Base.getBalance(returnToken, address(this)));
    }
}
