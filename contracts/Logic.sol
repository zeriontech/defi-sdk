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

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { Action, Approval, ActionType, AmountType } from "./Structs.sol";
import { InteractiveAdapter } from "./interactiveAdapters/InteractiveAdapter.sol";
import { ProtocolAdapter } from "./adapters/ProtocolAdapter.sol";
import { ERC20 } from "./ERC20.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";
import { Ownable } from "./Ownable.sol";
import { AdapterRegistry } from "./AdapterRegistry.sol";
import { TokenSpender } from "./TokenSpender.sol";
import { SafeERC20 } from "./SafeERC20.sol";


/**
 * @title Main contract executing actions.
 * TODO: reentrancy lock
 * TODO: safe math
 */
contract Logic is SignatureVerifier, Ownable {
    using SafeERC20 for ERC20;

    TokenSpender public tokenSpender;
    AdapterRegistry public adapterRegistry;

    event ExecutedAction(uint256 index);

    constructor(
        address _adapterRegistry
    )
        public
    {
        tokenSpender = new TokenSpender();
        adapterRegistry = AdapterRegistry(_adapterRegistry);
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function returnLostTokens(
        ERC20 token
    )
        external
        onlyOwner
    {
        token.safeTransfer(msg.sender, token.balanceOf(address(this)), "L![1]");

        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            msg.sender.transfer(ethBalance);
        }
    }

    /**
     * @notice Execute actions on signer's behalf.
     * @param actions Array with actions.
     * @param approvals Array with tokens approvals for the actions.
     * @param signatures Array with signatures for the approvals.
     */
     function executeActions(
         Action[] memory actions,
         Approval[] memory approvals,
         bytes[] memory signatures
     )
         public
         payable
     {
         executeActions(actions, approvals, getUserFromSignatures(approvals, signatures));
     }

    /**
     * @notice Execute actions on `msg.sender`'s behalf.
     * @param actions Array with actions.
     * @param approvals Array with tokens approvals for the actions.
     */
    function executeActions(
        Action[] memory actions,
        Approval[] memory approvals
    )
        public
        payable
    {
        executeActions(actions, approvals, msg.sender);
    }

    /**
     * @notice Execute actions on `user`'s behalf.
     * @param actions Array with actions.
     * @param approvals Array with tokens approvals for the actions.
     */
    function executeActions(
        Action[] memory actions,
        Approval[] memory approvals,
        address payable user
    )
        internal
    {
        address[][] memory tokensToBeWithdrawn = new address[][](actions.length + 1);

        tokensToBeWithdrawn[actions.length] = tokenSpender.issueTokens(approvals, user);

        for (uint256 i = 0; i < actions.length; i++) {
            tokensToBeWithdrawn[i] = callInteractiveAdapter(actions[i]);
            emit ExecutedAction(i);
        }

        returnTokens(tokensToBeWithdrawn, user);
    }

    function callInteractiveAdapter(
        Action memory action
    )
        internal
        returns (address[] memory)
    {
        require(action.actionType != ActionType.None, "L: wrong action type!");
        require(action.amounts.length == action.amountTypes.length, "L: inconsistent arrays![1]");
        require(action.amounts.length == action.tokens.length, "L: inconsistent arrays![2]");
        address[] memory adapters = adapterRegistry.getProtocolAdapters(action.protocolName);
        require(action.adapterIndex <= adapters.length, "L: wrong index!");
        address adapter = adapters[action.adapterIndex];

        bytes4 selector;
        if (action.actionType == ActionType.Deposit) {
            selector = InteractiveAdapter(adapter).deposit.selector;
        } else {
            selector = InteractiveAdapter(adapter).withdraw.selector;
        }

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = adapter.delegatecall(
            abi.encodeWithSelector(
                selector,
                action.tokens,
                action.amounts,
                action.amountTypes,
                action.data
            )
        );

        // assembly revert opcode is used here as `returnData`
        // is already bytes array generated by the callee's revert()
        // solhint-disable-next-line no-inline-assembly
        assembly {
            if eq(success, 0) { revert(add(returnData, 32), returndatasize()) }
        }

        address[] memory tokensToBeWithdrawn = abi.decode(returnData, (address[]));

        return tokensToBeWithdrawn;
    }

    function returnTokens(
        address[][] memory tokensToBeWithdrawn,
        address payable user
    )
        internal
    {
        ERC20 token;
        uint256 tokenBalance;
        for (uint256 i = 0; i < tokensToBeWithdrawn.length; i++) {
            for (uint256 j = 0; j < tokensToBeWithdrawn[i].length; j++) {
                token = ERC20(tokensToBeWithdrawn[i][j]);
                tokenBalance = token.balanceOf(address(this));
                if (tokenBalance > 0) {
                    token.safeTransfer(user, tokenBalance, "L!");
                }
            }
        }

        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            user.transfer(ethBalance);
        }
    }
}
