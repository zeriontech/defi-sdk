pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { Approval, AmountType } from "./Structs.sol";
import { Ownable } from "./Ownable.sol";
import { ERC20 } from "./ERC20.sol";
import { SafeERC20 } from "./SafeERC20.sol";


contract TokenSpender is Ownable {
    using SafeERC20 for ERC20;

    uint256 internal constant RELATIVE_AMOUNT_BASE = 100;

    function issueTokens(
        Approval[] calldata approvals,
        address user
    )
        external
        onlyOwner
        returns (address[] memory)
    {
        uint256 length = approvals.length;
        address[] memory assetsToBeWithdrawn = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            Approval memory approval = approvals[i];
            address token = approval.token;

            assetsToBeWithdrawn[i] = token;
            uint256 absoluteAmount = getAbsoluteAmount(approval, user);
            ERC20(token).safeTransferFrom(user, msg.sender, absoluteAmount);
        }

        return assetsToBeWithdrawn;
    }

    function getAbsoluteAmount(
        Approval memory approval,
        address user
    )
        internal
        view
        returns (uint256 absoluteAmount)
    {
        address token = approval.token;
        AmountType amountType = approval.amountType;
        uint256 amount = approval.amount;

        require(amountType != AmountType.None, "TS: wrong amount type!");

        if (amountType == AmountType.Relative) {
            require(amount <= RELATIVE_AMOUNT_BASE, "TS: wrong relative value!");

            absoluteAmount = ERC20(token).balanceOf(user) * amount / RELATIVE_AMOUNT_BASE;
        } else {
            absoluteAmount = amount;
        }
    }
}
