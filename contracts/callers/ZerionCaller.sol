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
import {
    BadMsgSender,
    BadProtocolAdapterName,
    NoneActionType,
    ZeroProtocolAdapterRegistry
} from "../shared/Errors.sol";
import { Action, TokenAmount } from "../shared/Structs.sol";
import { TokensHandler } from "../shared/TokensHandler.sol";

/**
 * @title Zerion caller that executes actions
 */
contract ZerionCaller is ICaller, TokensHandler {
    address internal immutable protocolAdapterRegistry_;

    /**
     * @notice Emits action info
     * @param protocolAdapterName Name of protocol adapter
     * @param actionType Type of action: deposit or withdraw
     * @param tokenAmounts Array of TokenAmount structs for the tokens used in this action
     * @param data ABI-encoded additional parameters
     */
    event ExecutedAction(
        bytes32 indexed protocolAdapterName,
        ActionType indexed actionType,
        TokenAmount[] tokenAmounts,
        bytes data
    );

    /**
     * @notice Sets ProtocolAdapterRegistry contract address, which is immutable
     * @param protocolAdapterRegistry Address of the ProtocolAdapterRegistry contract
     */
    constructor(address protocolAdapterRegistry) {
        if (protocolAdapterRegistry == address(0)) {
            revert ZeroProtocolAdapterRegistry();
        }

        protocolAdapterRegistry_ = protocolAdapterRegistry;
    }

    /**
     * @notice Main external function: executes actions and returns tokens to the `msg.sender`
     * @param callerCallData ABI-encoded parameters:
     *     - actions Array with actions to be executed
     */
    function callBytes(bytes calldata callerCallData) external payable override {
        Action[] memory actions = abi.decode(callerCallData, (Action[]));

        address[][] memory tokensToBeWithdrawn = new address[][](actions.length);

        uint256 length = actions.length;
        for (uint256 i = 0; i < length; i++) {
            tokensToBeWithdrawn[i] = executeAction(actions[i]);

            emit ExecutedAction(
                actions[i].protocolAdapterName,
                actions[i].actionType,
                actions[i].tokenAmounts,
                actions[i].data
            );
        }

        returnTokens(tokensToBeWithdrawn);
    }

    /**
     * @notice Executes one action via external call
     * @param action Action struct
     * @dev Can be called only by this contract
     * This function is used to create cross-protocol adapters
     * @return tokensToBeWithdrawn Array of tokens to be returned to the `msg.sender`
     */
    function executeExternal(Action memory action)
        external
        returns (address[] memory tokensToBeWithdrawn)
    {
        if (msg.sender != address(this)) revert BadMsgSender(msg.sender, address(this));

        return executeAction(action);
    }

    /**
     * @return protocolAdapterRegistry Address of the ProtocolAdapterRegistry contract used
     */
    function getProtocolAdapterRegistry() external view returns (address protocolAdapterRegistry) {
        return protocolAdapterRegistry_;
    }

    /**
     * @notice Executes one action and returns the list of tokens to be returned
     * @param action Action struct with with action to be executed
     * @return tokensToBeWithdrawn Array of tokens to be returned to the `msg.sender`
     */
    function executeAction(Action memory action)
        internal
        returns (address[] memory tokensToBeWithdrawn)
    {
        address adapter = IAdapterManager(protocolAdapterRegistry_).getAdapterAddress(
            action.protocolAdapterName
        );

        if (adapter == address(0)) {
            revert BadProtocolAdapterName(action.protocolAdapterName);
        }
        if (action.actionType == ActionType.None) {
            revert NoneActionType();
        }

        bytes4 selector = (action.actionType == ActionType.Deposit)
            ? IInteractiveAdapter.deposit.selector
            : IInteractiveAdapter.withdraw.selector;

        return
            abi.decode(
                Address.functionDelegateCall(
                    adapter,
                    abi.encodeWithSelector(selector, action.tokenAmounts, action.data)
                ),
                (address[])
            );
    }

    /**
     * @notice Returns tokens to the `msg.sender`
     * @param tokensToBeWithdrawn Array with the tokens returned by the adapters
     */
    function returnTokens(address[][] memory tokensToBeWithdrawn) internal {
        uint256 length;
        uint256 lengthNested;

        length = tokensToBeWithdrawn.length;
        for (uint256 i = 0; i < length; i++) {
            // TODO check what is cheaper -- to use lengthNested or to define in a loop
            lengthNested = tokensToBeWithdrawn[i].length;
            for (uint256 j = 0; j < lengthNested; j++) {
                address token = tokensToBeWithdrawn[i][j];
                Base.transfer(token, msg.sender, Base.getBalance(token, address(this)));
            }
        }
    }
}
