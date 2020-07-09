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

import { TransactionData, Action, Input, Output, AmountType } from "../shared/Structs.sol";
import { ERC20 } from "../shared/ERC20.sol";
import { SafeERC20 } from "../shared/SafeERC20.sol";
import { SignatureVerifier } from "./SignatureVerifier.sol";
import { Ownable } from "./Ownable.sol";
import { Core } from "./Core.sol";


interface GST2 {
    function freeUpTo(uint256) external;
}


contract Router is SignatureVerifier("Zerion Router"), Ownable {
    using SafeERC20 for ERC20;

    Core internal immutable _core;

    address internal constant GAS_TOKEN = 0x0000000000b3F879cb30FE243b4Dfee438691c04;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint256 internal constant DELIMITER = 1e18; // 100%
    uint256 internal constant BENEFICIARY_FEE_LIMIT = 1e16; // 1%
    uint256 internal constant BENEFICIARY_SHARE = 8e17; // 80%

    constructor(address payable core) public {
        require(core != address(0), "R: empty core!");
        _core = Core(core);
    }

    function returnLostTokens(
        ERC20 token,
        address payable beneficiary
    )
        external
        onlyOwner
    {
        token.safeTransfer(beneficiary, token.balanceOf(address(this)), "R!");

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
        returns (Output[] memory)
    {
        uint256 length = inputs.length;
        Output[] memory requiredAllowances = new Output[](length);
        uint256 required;
        uint256 current;

        for (uint256 i = 0; i < length; i++) {
            required = getAbsoluteAmount(inputs[i], account);
            current = ERC20(inputs[i].token).allowance(account, address(this));

            requiredAllowances[i] = Output({
                token: inputs[i].token,
                amount: required > current ? required - current : 0
            });
        }

        return requiredAllowances;
    }

    function getRequiredBalances(
        Input[] calldata inputs,
        address account
    )
        external
        view
        returns (Output[] memory)
    {
        uint256 length = inputs.length;
        Output[] memory requiredBalances = new Output[](length);
        uint256 required;
        uint256 current;

        for (uint256 i = 0; i < length; i++) {
            required = getAbsoluteAmount(inputs[i], account);
            current = ERC20(inputs[i].token).balanceOf(account);

            requiredBalances[i] = Output({
                token: inputs[i].token,
                amount: required > current ? required - current : 0
            });
        }

        return requiredBalances;
    }

    /**
     * @return Address of the Core contract used.
     */
    function getCore()
        external
        view
        returns (address)
    {
        return address(_core);
    }

    function startExecution(
        TransactionData memory data,
        bytes memory signature
    )
        public
        payable
        returns (Output[] memory)
    {
        return startExecution(
            data.actions,
            data.inputs,
            data.requiredOutputs,
            getAccountFromSignature(data, signature)
        );
    }

    function startExecution(
        Action[] memory actions,
        Input[] memory inputs,
        Output[] memory requiredOutputs
    )
        public
        payable
        returns (Output[] memory)
    {
        return startExecution(
            actions,
            inputs,
            requiredOutputs,
            msg.sender
        );
    }

    function startExecution(
        Action[] memory actions,
        Input[] memory inputs,
        Output[] memory requiredOutputs,
        address payable account
    )
        internal
        returns (Output[] memory)
    {
        // save initial gas to burn gas token later
        uint256 gas = gasleft();
        // transfer tokens to _core, handle fees (if any), and add these tokens to outputs
        transferTokens(inputs, account);
        Output[] memory modifiedOutputs = modifyOutputs(requiredOutputs, inputs);
        // call Core contract with all provided ETH, actions, expected outputs and account address
        Output[] memory actualOutputs = _core.executeActions{value: msg.value}(
            actions,
            modifiedOutputs,
            account
        );
        // burn gas token to save some gas
        freeGasToken(gas - gasleft());

        return actualOutputs;
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
            require(absoluteAmount > 0, "R: zero amount!");

            // in case inputs includes fees:
            //     - absolute amount is amount calculated based on inputs
            //     - _core amount is absolute amount excluding fee set in inputs
            //     - beneficiary amount is beneficiary share (80%) of non-_core amount
            //     - this contract fee is the rest of beneficiary fee (~20%)
            // otherwise no fees are charged!
            if (inputs[i].fee > 0) {
                require(inputs[i].beneficiary != address(0), "R: bad beneficiary!");
                require(inputs[i].fee <= BENEFICIARY_FEE_LIMIT, "R: bad fee!");

                uint256 feeAmount = mul(absoluteAmount, inputs[i].fee) / DELIMITER;
                uint256 beneficiaryAmount = mul(feeAmount, BENEFICIARY_SHARE) / DELIMITER;
                uint256 thisAmount = feeAmount - beneficiaryAmount;
                uint256 coreAmount = absoluteAmount - feeAmount;

                ERC20(inputs[i].token).safeTransferFrom(
                    account,
                    address(_core),
                    coreAmount,
                    "R![1]"
                );

                if (beneficiaryAmount > 0) {
                    ERC20(inputs[i].token).safeTransferFrom(
                        account,
                        inputs[i].beneficiary,
                        beneficiaryAmount,
                        "R![2]"
                    );
                }

                if (thisAmount > 0) {
                    ERC20(inputs[i].token).safeTransferFrom(
                        account,
                        address(this),
                        thisAmount,
                        "R![3]"
                    );
                }
            } else {
                ERC20(inputs[i].token).safeTransferFrom(
                    account,
                    address(_core),
                    absoluteAmount,
                    "R!"
                );
            }
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

        require(amountType != AmountType.None, "R: bad type!");

        if (amountType == AmountType.Relative) {
            require(amount <= DELIMITER, "R: bad value!");
            if (amount == DELIMITER) {
                return ERC20(token).balanceOf(account);
            } else {
                return mul(ERC20(token).balanceOf(account), amount) / DELIMITER;
            }
        } else {
            return amount;
        }
    }

    function modifyOutputs(
        Output[] memory requiredOutputs,
        Input[] memory inputs
    )
        internal
        view
        returns (Output[] memory)
    {
        uint256 ethInput = msg.value > 0 ? 1 : 0;
        Output[] memory modifiedOutputs = new Output[](
            requiredOutputs.length + inputs.length + ethInput
        );

        for (uint256 i = 0; i < requiredOutputs.length; i++) {
            modifiedOutputs[i] = requiredOutputs[i];
        }

        for (uint256 i = 0; i < inputs.length; i++) {
            modifiedOutputs[requiredOutputs.length + i] = Output({
                token: inputs[i].token,
                amount: 0
            });
        }

        if (ethInput > 0) {
            modifiedOutputs[requiredOutputs.length + inputs.length] = Output({
                token: ETH,
                amount: 0
            });
        }

        return modifiedOutputs;
    }

    function mul(
        uint256 a,
        uint256 b
    )
        internal
        pure
        returns (uint256)
    {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "R: mul overflow");

        return c;
    }
}
