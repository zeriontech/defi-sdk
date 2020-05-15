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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { TransactionData, AmountType, Input, Output } from "./Structs.sol";
import { ERC20 } from "./ERC20.sol";
import { SafeERC20 } from "./SafeERC20.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";
import { Ownable } from "./Ownable.sol";
import { Logic } from "./Logic.sol";

interface GST2 {
    function freeUpTo(uint256) external;
}


contract TokenSpender is SignatureVerifier, Ownable {
    using SafeERC20 for ERC20;

    Logic public immutable logic;
    address internal constant GAS_TOKEN = 0x0000000000b3F879cb30FE243b4Dfee438691c04;
    uint256 internal constant BASE = 1e18;
    uint256 internal constant BENEFICIARY_FEE_LIMIT = 1e16; // 1%
    uint256 internal constant BENEFICIARY_SHARE = 2e17; // 80%

    constructor(address payable _logic) public {
        logic = Logic(_logic);
    }

    function returnLostTokens(
        ERC20 token,
        address payable beneficiary
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

    function startExecution(
        TransactionData memory data,
        bytes memory signature
    )
        public
        payable
    {
        startExecution(data, getAccountFromSignature(data, signature));
    }

    function startExecution(
        TransactionData memory data
    )
        public
        payable
    {
        startExecution(data, msg.sender);
    }

    function getRequiredAllowances(
        Input[] memory inputs,
        address account
    )
        public
        view
        returns (Output[] memory allowances)
    {
        allowances = new Output[](inputs.length);
        uint256 required;
        uint256 current;

        for (uint256 i = 0; i < inputs.length; i++) {
            required = getAbsoluteAmount(inputs[i], account);
            current = ERC20(inputs[i].token).allowance(account, address(this));

            allowances[i] = Output({
                token: inputs[i].token,
                amount: required > current ? required - current : 0
            });
        }
    }

    function startExecution(
        TransactionData memory data,
        address payable account
    )
        internal
    {
        // save initial gas to burn gas token later
        uint256 gas = gasleft();
        // transfer tokens to logic and handle fees (if any)
        transferTokens(data.inputs, account);
        // call Logic contract with all provided ETH, actions, expected outputs and account address
        logic.executeActions{value: msg.value}(data.actions, data.outputs, account);
        // burn gas token to save some gas
        freeGasToken(gas - gasleft());
    }

    function transferTokens(
        Input[] memory inputs,
        address account
    )
        internal
    {
        uint256 absoluteAmount;

        for (uint256 i = 0; i < inputs.length; i++) {
            absoluteAmount = getAbsoluteAmount(inputs[i], account);
            require(absoluteAmount > 0, "TS: 0 amount!");

            // in case inputs includes fees:
            //     - absolute amount is amount calculated based on inputs
            //     - logic amount is absolute amount excluding fee set in inputs
            //     - beneficiary amount is beneficiary share (80%) of non-logic amount
            //     - this contract fee is the rest of beneficiary fee (~20%)
            // otherwise no fees are charged!
            if (inputs[i].fee > 0) {
                require(inputs[i].beneficiary != address(0), "TS: bad beneficiary!");
                require(inputs[i].fee < BENEFICIARY_FEE_LIMIT, "TS: bad fee!");

                uint256 logicAmount = mul(absoluteAmount, BASE - inputs[i].fee) / BASE;
                uint256 beneficiaryAmount = mul(absoluteAmount - logicAmount, BENEFICIARY_SHARE) / BASE;
                uint256 thisAmount = absoluteAmount - logicAmount - beneficiaryAmount;

                if (logicAmount > 0) {
                    ERC20(inputs[i].token).safeTransferFrom(
                        account,
                        address(logic),
                        logicAmount,
                        "TS![1]"
                    );
                }

                if (beneficiaryAmount > 0) {
                    ERC20(inputs[i].token).safeTransferFrom(
                        account,
                        inputs[i].beneficiary,
                        beneficiaryAmount,
                        "TS![2]"
                    );
                }

                if (thisAmount > 0) {
                    ERC20(inputs[i].token).safeTransferFrom(
                        account,
                        address(this),
                        absoluteAmount - logicAmount - beneficiaryAmount,
                        "TS![3]"
                    );
                }
            } else {
                ERC20(inputs[i].token).safeTransferFrom(
                    account,
                    address(logic),
                    absoluteAmount,
                    "TS!"
                );
            }
        }
    }

    function getAbsoluteAmount(
        Input memory input,
        address account
    )
        internal
        view
        returns (uint256)
    {
        address token = input.token;
        AmountType amountType = input.amountType;
        uint256 amount = input.amount;

        require(amountType != AmountType.None, "TS: bad type!");

        if (amountType == AmountType.Relative) {
            require(amount <= BASE, "TS: bad value!");
            if (amount == BASE) {
                return ERC20(token).balanceOf(account);
            } else {
                return ERC20(token).balanceOf(account) * amount / BASE;
            }
        } else {
            return amount;
        }
    }

    function freeGasToken(
        uint256 desiredAmount
    )
        internal
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

    function mul(
        uint256 a,
        uint256 b
    )
        internal
        pure
        returns (uint256)
    {
        uint256 c = a * b;
        require(c / a == b, "TS: multiplication overflow");

        return c;
    }
}
