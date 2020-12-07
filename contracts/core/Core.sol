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

import {
    Action,
    TokenAmount,
    AbsoluteTokenAmount,
    ActionType,
    AmountType
} from "../shared/Structs.sol";
import { InteractiveAdapter } from "../interactiveAdapters/InteractiveAdapter.sol";
import { ERC20 } from "../shared/ERC20.sol";
import { ProtocolAdapterRegistry } from "./ProtocolAdapterRegistry.sol";
import { SafeERC20 } from "../shared/SafeERC20.sol";
import { Helpers } from "../shared/Helpers.sol";
import { ReentrancyGuard } from "./ReentrancyGuard.sol";

/**
 * @title Main contract executing actions.
 */
contract Core is ReentrancyGuard {
    using SafeERC20 for ERC20;
    using Helpers for uint256;
    using Helpers for address;

    address internal immutable protocolAdapterRegistry_;

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    event ExecutedAction(
        bytes32 indexed protocolAdapterName,
        ActionType indexed actionType,
        TokenAmount[] tokenAmounts,
        bytes data
    );

    constructor(address protocolAdapterRegistry) {
        require(protocolAdapterRegistry != address(0), "C: empty protocolAdapterRegistry");

        protocolAdapterRegistry_ = protocolAdapterRegistry;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /**
     * @notice Executes actions and returns tokens to account.
     * @param actions Array with actions to be executed.
     * @param requiredOutputs Array with required amounts for the returned tokens.
     * @param account Address that will receive all the resulting funds.
     * @return Array with actual amounts of the returned tokens.
     */
    function executeActions(
        Action[] calldata actions,
        AbsoluteTokenAmount[] calldata requiredOutputs,
        address payable account
    ) external payable nonReentrant returns (AbsoluteTokenAmount[] memory) {
        require(account != address(0), "C: empty account");
        address[][] memory tokensToBeWithdrawn = new address[][](actions.length);

        for (uint256 i = 0; i < actions.length; i++) {
            tokensToBeWithdrawn[i] = executeAction(actions[i]);
            emit ExecutedAction(
                actions[i].protocolAdapterName,
                actions[i].actionType,
                actions[i].tokenAmounts,
                actions[i].data
            );
        }

        return returnTokens(requiredOutputs, tokensToBeWithdrawn, account);
    }

    /**
     * @notice Execute one action via external call.
     * @param action Action struct.
     * @dev Can be called only by this contract.
     * This function is used to create cross-protocol adapters.
     */
    function executeExternal(Action calldata action) external returns (address[] memory) {
        require(msg.sender == address(this), "C: only address(this)");
        return executeAction(action);
    }

    /**
     * @return Address of the ProtocolAdapterRegistry contract used.
     */
    function protocolAdapterRegistry() external view returns (address) {
        return protocolAdapterRegistry_;
    }

    /**
     * @notice Executes one action and returns the list of tokens to be returned.
     * @param action Action struct with with action to be executed.
     * @return List of tokens addresses to be returned by the action.
     */
    function executeAction(Action calldata action) internal returns (address[] memory) {
        address adapter =
            ProtocolAdapterRegistry(protocolAdapterRegistry_).getProtocolAdapterAddress(
                action.protocolAdapterName
            );
        require(adapter != address(0), "C: bad name");
        require(
            action.actionType == ActionType.Deposit || action.actionType == ActionType.Withdraw,
            "C: bad action type"
        );
        bytes4 selector;
        if (action.actionType == ActionType.Deposit) {
            selector = InteractiveAdapter(adapter).deposit.selector;
        } else {
            selector = InteractiveAdapter(adapter).withdraw.selector;
        }

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) =
            adapter.delegatecall(
                abi.encodeWithSelector(selector, action.tokenAmounts, action.data)
            );

        // assembly revert opcode is used here as `returnData`
        // is already bytes array generated by the callee's revert()
        // solhint-disable-next-line no-inline-assembly
        assembly {
            if eq(success, 0) {
                revert(add(returnData, 32), returndatasize())
            }
        }

        return abi.decode(returnData, (address[]));
    }

    /**
     * @notice Returns tokens to the account used as function parameter.
     * @param requiredOutputs Array with required amounts for the returned tokens.
     * @param tokensToBeWithdrawn Array with the tokens returned by the adapters.
     * @param account Address that will receive all the resulting funds.
     * @return Array with actual amounts of the returned tokens.
     */
    function returnTokens(
        AbsoluteTokenAmount[] calldata requiredOutputs,
        address[][] memory tokensToBeWithdrawn,
        address payable account
    ) internal returns (AbsoluteTokenAmount[] memory) {
        uint256 length = requiredOutputs.length;
        uint256 lengthNested;
        address token;
        AbsoluteTokenAmount[] memory actualOutputs = new AbsoluteTokenAmount[](length);

        for (uint256 i = 0; i < length; i++) {
            token = requiredOutputs[i].token;
            actualOutputs[i] = AbsoluteTokenAmount({
                token: token,
                amount: checkRequirementAndTransfer(token, requiredOutputs[i].amount, account)
            });
        }

        length = tokensToBeWithdrawn.length;
        for (uint256 i = 0; i < length; i++) {
            lengthNested = tokensToBeWithdrawn[i].length;
            for (uint256 j = 0; j < lengthNested; j++) {
                checkRequirementAndTransfer(tokensToBeWithdrawn[i][j], 0, account);
            }
        }

        return actualOutputs;
    }

    /**
     * @notice Checks the requirement for the given token and (in case the check passes)
     * transfers tokens to the account used as function parameter.
     * @param token Address of the returned token.
     * @param requiredAmount Required amount for the returned token.
     * @param account Address that will receive the returned token.
     * @return Actual amount of the returned token.
     */
    function checkRequirementAndTransfer(
        address token,
        uint256 requiredAmount,
        address account
    ) internal returns (uint256) {
        uint256 actualAmount;
        if (token == ETH) {
            actualAmount = address(this).balance;
        } else {
            actualAmount = ERC20(token).balanceOf(address(this));
        }

        require(
            actualAmount >= requiredAmount,
            string(
                abi.encodePacked(
                    "C: ",
                    actualAmount.toString(),
                    " is less than ",
                    requiredAmount.toString(),
                    " for ",
                    token.toString()
                )
            )
        );

        if (actualAmount > 0) {
            if (token == ETH) {
                // solhint-disable-next-line avoid-low-level-calls
                (bool success, ) = account.call{ value: actualAmount }(new bytes(0));
                require(success, "ETH transfer to account failed");
            } else {
                ERC20(token).safeTransfer(account, actualAmount, "C");
            }
        }

        return actualAmount;
    }
}
