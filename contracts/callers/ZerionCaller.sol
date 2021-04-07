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

import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { BaseCaller } from "./BaseCaller.sol";
import { IAdapterManager } from "../interfaces/IAdapterManager.sol";
import { ICaller } from "../interfaces/ICaller.sol";
import { IInteractiveAdapter } from "../interfaces/IInteractiveAdapter.sol";
import { Base } from "../shared/Base.sol";
import { Action, ActionType, TokenAmount } from "../shared/Structs.sol";

/**
 * @title Zerion caller that executs actions.
 */
contract ZerionCaller is ICaller, BaseCaller, ReentrancyGuard {
    address internal immutable protocolAdapterRegistry_;

    event ExecutedAction(
        bytes32 indexed protocolAdapterName,
        ActionType indexed actionType,
        TokenAmount[] tokenAmounts,
        bytes data
    );

    constructor(address protocolAdapterRegistry) {
        require(protocolAdapterRegistry != address(0), "ZC: empty protocolAdapterRegistry");

        protocolAdapterRegistry_ = protocolAdapterRegistry;
    }

    /**
     * @notice Main external function:
     *     executes actions and returns tokens to the account.
     * @param callData ABI-encoded parameters:
     *     - actions Array with actions to be executed.
     */
    function callBytes(bytes calldata callData) external payable override nonReentrant {
        Action[] memory actions = abi.decode(callData, (Action[]));
        address payable account = getAccount();

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

        returnTokens(tokensToBeWithdrawn, account);
    }

    /**
     * @notice Executes one action via external call.
     * @param action Action struct.
     * @dev Can be called only by this contract.
     * This function is used to create cross-protocol adapters.
     */
    function executeExternal(Action memory action) external returns (address[] memory) {
        require(msg.sender == address(this), "ZC: only address(this)");

        return executeAction(action);
    }

    /**
     * @return Address of the ProtocolAdapterRegistry contract used.
     */
    function getProtocolAdapterRegistry() external view returns (address) {
        return protocolAdapterRegistry_;
    }

    /**
     * @notice Always reverts as there is no fixed outputs case.
     * @dev Implementation of Caller interface function.
     */
    function getExactInputAmount(bytes calldata) external pure override returns (uint256) {
        revert("ZC: fixed outputs");
    }

    /**
     * @notice Executes one action and returns the list of tokens to be returned.
     * @param action Action struct with with action to be executed.
     * @return List of tokens addresses to be returned by the action.
     */
    function executeAction(Action memory action) internal returns (address[] memory) {
        address adapter =
            IAdapterManager(protocolAdapterRegistry_).getAdapterAddress(
                action.protocolAdapterName
            );
        require(adapter != address(0), "ZC: bad name");
        require(
            action.actionType == ActionType.Deposit || action.actionType == ActionType.Withdraw,
            "ZC: bad action type"
        );

        bytes4 selector =
            (action.actionType == ActionType.Deposit)
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
     * @notice Returns tokens to the account address.
     * @param tokensToBeWithdrawn Array with the tokens returned by the adapters.
     * @param account The address that will receive all the resulting tokens.
     */
    function returnTokens(address[][] memory tokensToBeWithdrawn, address payable account)
        internal
    {
        uint256 length;
        uint256 lengthNested;

        length = tokensToBeWithdrawn.length;
        for (uint256 i = 0; i < length; i++) {
            // TODO check what is cheaper -- to use lengthNested or to define in a loop
            lengthNested = tokensToBeWithdrawn[i].length;
            for (uint256 j = 0; j < lengthNested; j++) {
                transferPositiveAmount(tokensToBeWithdrawn[i][j], account);
            }
        }
    }

    /**
     * @notice Transfers tokens to the account address (if the transfer amount is positive).
     * @param token Address of the returned token.
     * @param account The address that will receive the returned token.
     * @dev This function is compatible only with ERC20 tokens and Ether, not ERC721 tokens.
     */
    function transferPositiveAmount(address token, address account) internal {
        uint256 actualAmount = Base.getBalance(token, address(this));

        if (actualAmount > 0) {
            Base.transfer(token, account, actualAmount);
        }
    }
}
