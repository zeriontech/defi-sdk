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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { TransactionData, Action, Input, Output, AmountType } from "./Structs.sol";
import { ERC20 } from "./ERC20.sol";
import { SafeERC20 } from "./SafeERC20.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";
import { Ownable } from "./Ownable.sol";
import { Core } from "./Core.sol";


interface GST2 {
    function freeUpTo(uint256) external;
}


contract Router is SignatureVerifier("Zerion Router"), Ownable {
    using SafeERC20 for ERC20;

    Core public immutable core;
    address internal constant GAS_TOKEN = 0x0000000000b3F879cb30FE243b4Dfee438691c04;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint256 internal constant BASE = 1e18; // 100%
    uint256 internal constant BENEFICIARY_FEE_LIMIT = 1e16; // 1%
    uint256 internal constant BENEFICIARY_SHARE = 2e17; // 80%

    constructor(address payable _core) public {
        require(_core != address(0), "TS: empty core!");
        core = Core(_core);
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

    function getRequiredAllowances(
        Input[] calldata inputs,
        address account
    )
        external
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

    function getRequiredBalances(
        Input[] calldata inputs,
        address account
    )
        external
        view
        returns (Output[] memory balances)
    {
        balances = new Output[](inputs.length);
        uint256 required;
        uint256 current;

        for (uint256 i = 0; i < inputs.length; i++) {
            required = getAbsoluteAmount(inputs[i], account);
            current = ERC20(inputs[i].token).balanceOf(account);

            balances[i] = Output({
                token: inputs[i].token,
                amount: required > current ? required - current : 0
            });
        }
    }

    function startExecution(
        TransactionData calldata data,
        bytes calldata signature
    )
        external
        payable
    {
        startExecution(
            data.actions,
            data.inputs,
            data.outputs,
            getAccountFromSignature(data, signature)
        );
    }

    function startExecution(
        Action[] calldata actions,
        Input[] calldata inputs,
        Output[] calldata outputs
    )
        external
        payable
    {
        startExecution(
            actions,
            inputs,
            outputs,
            msg.sender
        );
    }

    function startExecution(
        Action[] calldata actions,
        Input[] calldata inputs,
        Output[] calldata outputs,
        address payable account
    )
        internal
    {
        // save initial gas to burn gas token later
        uint256 gas = gasleft();
        // transfer tokens to core, handle fees (if any), and add these tokens to outputs
        address[] memory inputTokens = transferTokens(inputs, account);
        Output[] memory modifiedOutputs = modifyOutputs(outputs, inputTokens);
        // call Core contract with all provided ETH, actions, expected outputs and account address
        core.executeActions{value: msg.value}(actions, modifiedOutputs, account);
        // burn gas token to save some gas
        freeGasToken(gas - gasleft());
    }

    function transferTokens(
        Input[] calldata inputs,
        address account
    )
        internal
        returns (address[] memory)
    {
        address[] memory tokensToBeWithdrawn = new address[](inputs.length);
        uint256 absoluteAmount;

        for (uint256 i = 0; i < inputs.length; i++) {
            absoluteAmount = getAbsoluteAmount(inputs[i], account);
            require(absoluteAmount > 0, "TS: 0 amount!");
            tokensToBeWithdrawn[i] = inputs[i].token;

            // in case inputs includes fees:
            //     - absolute amount is amount calculated based on inputs
            //     - core amount is absolute amount excluding fee set in inputs
            //     - beneficiary amount is beneficiary share (80%) of non-core amount
            //     - this contract fee is the rest of beneficiary fee (~20%)
            // otherwise no fees are charged!
            if (inputs[i].fee > 0) {
                require(inputs[i].beneficiary != address(0), "TS: bad beneficiary!");
                require(inputs[i].fee < BENEFICIARY_FEE_LIMIT, "TS: bad fee!");

                uint256 coreAmount = mul(absoluteAmount, BASE - inputs[i].fee) / BASE;
                uint256 beneficiaryAmount = mul(absoluteAmount - coreAmount, BENEFICIARY_SHARE) / BASE;
                uint256 thisAmount = absoluteAmount - coreAmount - beneficiaryAmount;

                if (coreAmount > 0) {
                    ERC20(inputs[i].token).safeTransferFrom(
                        account,
                        address(core),
                        coreAmount,
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
                        absoluteAmount - coreAmount - beneficiaryAmount,
                        "TS![3]"
                    );
                }
            } else {
                ERC20(inputs[i].token).safeTransferFrom(
                    account,
                    address(core),
                    absoluteAmount,
                    "TS!"
                );
            }
        }

        return tokensToBeWithdrawn;
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

    function getAbsoluteAmount(
        Input calldata input,
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
                return mul(ERC20(token).balanceOf(account), amount) / BASE;
            }
        } else {
            return amount;
        }
    }

    function modifyOutputs(
        Output[] calldata outputs,
        address[] memory additionalTokens
    )
        internal
        view
        returns (Output[] memory modifiedOutputs)
    {
        uint256 ethInput = msg.value > 0 ? 1 : 0;
        modifiedOutputs = new Output[](outputs.length + additionalTokens.length + ethInput);

        for (uint256 i = 0; i < outputs.length; i++) {
            modifiedOutputs[i] = outputs[i];
        }

        for (uint256 i = 0; i < additionalTokens.length; i++) {
            modifiedOutputs[outputs.length + i] = Output({
                token: additionalTokens[i],
                amount: 0
            });
        }

        if (ethInput > 0) {
            modifiedOutputs[outputs.length + additionalTokens.length] = Output({
                token: ETH,
                amount: 0
            });
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
        require(c / a == b, "TS: mul overflow");

        return c;
    }
}
