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

import { Approval, AmountType } from "./Structs.sol";
import { Ownable } from "./Ownable.sol";
import { ERC20 } from "./ERC20.sol";
import { SafeERC20 } from "./SafeERC20.sol";


contract TokenSpender is Ownable {
    using SafeERC20 for ERC20;

    address internal constant GAS_TOKEN = 0x0000000000b3F879cb30FE243b4Dfee438691c04;
    uint256 internal constant BASE = 1e18;
    uint256 internal constant BENEFICIARY_FEE_LIMIT = 1e16; // 1%
    uint256 internal constant BENEFICIARY_SHARE = 2e17; // 80%

    function returnLostTokens(
        ERC20 token,
        address beneficiary
    )
        external
        onlyOwner
    {
        token.safeTransfer(beneficiary, token.balanceOf(address(this)), "TS!");

        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            beneficiary.transfer(ethBalance);
        }
    }

    function freeGasToken(
        uint256 desiredAmount
    )
        external
        onlyOwner
    {
        uint256 safeAmount = 0;
        uint256 gas = gasleft();

        if (gas >= 27710) {
            safeAmount = (gas - 27710) / 7020; // 1148 + 5722 + 150
        }

        if (desiredAmount > safeAmount) {
            desiredAmount = safeAmount;
        }

        if (desiredAmount > 0) {
            GST2(GAS_TOKEN).freeUpTo(desiredAmount);
        }
    }

    function issueTokens(
        Approval[] memory approvals,
        address user
    )
        public
        onlyOwner
        returns (address[] memory assetsToBeWithdrawn)
    {
        assetsToBeWithdrawn = new address[](approvals.length);
        uint256 absoluteAmount;
        uint256 logicAmount;
        uint256 beneficiaryAmount;

        for (uint256 i = 0; i < approvals.length; i++) {
            assetsToBeWithdrawn[i] = approvals[i].token;

            if (fee > 0) {
                require(beneficiary != address(0), "TS: bad beneficiary!");
                require(fee < BENEFICIARY_FEE_LIMIT, "TS: bad fee!");

                absoluteAmount = getAbsoluteAmount(approvals[i], user);
                logicAmount = absoluteAmount * (BASE - approvals[i].fee) / BASE;
                beneficiaryAmount = absoluteAmount * approvals[i].fee * BENEFICIARY_SHARE / BASE;

                ERC20(approval.token).safeTransferFrom(
                    user,
                    msg.sender,
                    logicAmount,
                    "TS![1]"
                );

                ERC20(approval.token).safeTransferFrom(
                    user,
                    approvals[i].beneficiary,
                    beneficiaryAmount,
                    "TS![2]"
                );

                ERC20(approval.token).safeTransferFrom(
                    user,
                    address(this),
                    absoluteAmount - logicAmount - beneficiaryAmount,
                    "TS![3]"
                );
            } else {
                ERC20(approval.token).safeTransferFrom(
                    user,
                    msg.sender,
                    getAbsoluteAmount(approvals[i], user),
                    "TS!"
                );
            }
        }
    }

    function getRequiredAllowances(
        Approval[] memory approvals,
        address user
    )
        public
        view
        returns (TokenAmount[] memory allowances)
    {
        allowances = new TokenAmount[](approvals.length);
        uint256 required;
        uint256 current;

        for (uint256 i = 0; i < approvals.length; i++) {
            required = getAbsoluteAmount(approval, user);
            current = ERC20(approvals[i].token).allowance(user, address(this));

            allowances[i] = Allowance({
                token: approvals[i].token,
                amount: required > current ? required - current : 0
            });
        }
    }

    function getAbsoluteAmount(
        Approval memory approval,
        address user
    )
        internal
        view
        returns (uint256)
    {
        address token = approval.token;
        AmountType amountType = approval.amountType;
        uint256 amount = approval.amount;

        require(amountType != AmountType.None, "TS: bad type!");

        if (amountType == AmountType.Relative) {
            require(amount <= BASE, "TS: bad value!");
            if (amount == BASE) {
                return ERC20(token).balanceOf(user);
            } else {
                return ERC20(token).balanceOf(user) * amount / BASE;
            }
        } else {
            return amount;
        }
    }
}
