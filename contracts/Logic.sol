pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { Action, Approval, ActionType, AmountType } from "./Structs.sol";
import { InteractiveAdapter } from "./interactiveAdapters/InteractiveAdapter.sol";
import { ProtocolAdapter } from "./adapters/ProtocolAdapter.sol";
import { ERC20 } from "./ERC20.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";
import { AdapterRegistry } from "./AdapterRegistry.sol";
import { TokenSpender } from "./TokenSpender.sol";
import { SafeERC20 } from "./SafeERC20.sol";
import { Strings } from "./Strings.sol";


/**
 * @title Main contract executing actions.
 */
contract Logic is SignatureVerifier {
    using SafeERC20 for ERC20;
    using Strings for string;

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
//
//    // solhint-disable-next-line no-empty-blocks
//    receive() external payable {}

//    /**
//     * @notice Execute actions on signer's behalf.
//     * @param actions Array with actions.
//     * @param approvals Array with tokens approvals for the actions.
//     * @param signatures Array with signatures for the approvals.
//     */
//     function executeActions(
//         Action[] memory actions,
//         Approval[] memory approvals,
//         bytes[] memory signatures
//     )
//         public
//         payable
//     {
//         executeActions(actions, approvals, getUserFromSignatures(approvals, signatures));
//     }

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
        uint256 length = actions.length;
        address[][] memory tokensToBeWithdrawn = new address[][](length + 1);

        tokensToBeWithdrawn[0] = tokenSpender.issueTokens(approvals, user);

        for (uint256 i = 0; i < length; i++) {
            tokensToBeWithdrawn[i + 1] = callInteractiveAdapter(actions[i]);
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
        uint256 index = action.adapterType.isEqualTo("Debt") ? 1 : 0;
        address adapter = adapterRegistry.getProtocolAdapters(action.protocolName)[index];
        require(
            ProtocolAdapter(adapter).adapterType().isEqualTo(action.adapterType),
            "L: wrong index!"
        );

        bool success;
        bytes memory returnData;
        if (action.actionType == ActionType.Deposit) {
            // solhint-disable-next-line avoid-low-level-calls
            (success, returnData) = adapter.delegatecall(
                abi.encodeWithSelector(
                    InteractiveAdapter(adapter).deposit.selector,
                    action.tokens,
                    action.amounts,
                    action.amountTypes,
                    action.data
                )
            );
        } else {
            // solhint-disable-next-line avoid-low-level-calls
            (success, returnData) = adapter.delegatecall(
                abi.encodeWithSelector(
                    InteractiveAdapter(adapter).withdraw.selector,
                    action.tokens,
                    action.amounts,
                    action.amountTypes,
                    action.data
                )
            );
        }

        require(success, "L: revert in action's delegatecall!");

        return abi.decode(returnData, (address[]));
    }

    function returnTokens(
        address[][] memory tokensToBeWithdrawn,
        address payable user
    )
        internal
    {
        ERC20 asset;
        uint256 assetBalance;

        for (uint256 i = 0; i < tokensToBeWithdrawn.length; i++) {
            for(uint256 j = 0; j < tokensToBeWithdrawn[i].length; j++) {
                asset = ERC20(tokensToBeWithdrawn[i][j]);
                assetBalance = asset.balanceOf(address(this));
                if (assetBalance > 0) {
                    asset.safeTransfer(user, assetBalance);
                }
            }
        }

        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            user.transfer(ethBalance);
        }
    }
}
