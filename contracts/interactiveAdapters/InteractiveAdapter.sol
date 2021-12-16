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

import { IInteractiveAdapter } from "../interfaces/IInteractiveAdapter.sol";
import { ProtocolAdapter } from "../protocolAdapters/ProtocolAdapter.sol";
import { Base } from "../shared/Base.sol";
import { AmountType } from "../shared/Enums.sol";
import { ExceedingDelimiterAmount, NoneAmountType } from "../shared/Errors.sol";
import { TokenAmount } from "../shared/Structs.sol";

/**
 * @title Base contract for interactive protocol adapters.
 * @dev deposit() and withdraw() functions MUST be implemented
 *     as well as all the functions from ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract InteractiveAdapter is IInteractiveAdapter, ProtocolAdapter {
    uint256 internal constant DELIMITER = 1e18;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @dev The function must deposit assets to the protocol.
     * MUST return array of tokens to be returned to the account.
     * @param tokenAmounts Array of TokenAmount structs for the tokens used in deposit action.
     * @param data ABI-encoded additional parameters.
     * @return tokensToBeWithdrawn Array of tokens to be returned to the account.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        virtual
        override
        returns (address[] memory tokensToBeWithdrawn);

    /**
     * @dev The function must withdraw assets from the protocol.
     * MUST return array of tokens to be returned to the account.
     * @param tokenAmounts Array of TokenAmount structs for the tokens used in withdraw action.
     * @param data ABI-encoded additional parameters.
     * @return tokensToBeWithdrawn Array of tokens to be returned to the account.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        virtual
        override
        returns (address[] memory tokensToBeWithdrawn);

    /**
     * @dev MUST be used only in `withdraw()` function.
     * @param tokenAmount TokenAmount struct with token address, amount, and amount type.
     * @return absoluteAmountWithdraw Absolute amount for the withdraw action.
     */
    function getAbsoluteAmountWithdraw(TokenAmount calldata tokenAmount)
        internal
        virtual
        returns (uint256 absoluteAmountWithdraw)
    {
        AmountType amountType = tokenAmount.amountType;
        // TODO consider using uint256 amount = tokenAmount.amount

        if (amountType == AmountType.None) {
            revert NoneAmountType();
        }

        if (amountType == AmountType.Absolute) {
            return tokenAmount.amount;
        }

        if (tokenAmount.amount > DELIMITER) {
            revert ExceedingDelimiterAmount(tokenAmount.amount);
        }

        int256 balanceSigned = getBalance(tokenAmount.token, address(this));
        uint256 balance = balanceSigned > 0 ? uint256(balanceSigned) : uint256(-balanceSigned);

        if (tokenAmount.amount == DELIMITER) {
            return balance;
        }

        return (balance * tokenAmount.amount) / DELIMITER;
    }

    /**
     * @dev MUST be used only in `deposit()` function.
     * @param tokenAmount TokenAmount struct with token address, amount, and amount type.
     * @return absoluteAmountDeposit Absolute amount for the deposit action.
     */
    function getAbsoluteAmountDeposit(TokenAmount calldata tokenAmount)
        internal
        view
        virtual
        returns (uint256 absoluteAmountDeposit)
    {
        AmountType amountType = tokenAmount.amountType;

        if (amountType == AmountType.None) {
            revert NoneAmountType();
        }

        if (amountType == AmountType.Absolute) {
            return tokenAmount.amount;
        }

        if (tokenAmount.amount > DELIMITER) {
            revert ExceedingDelimiterAmount(tokenAmount.amount);
        }

        uint256 balance = Base.getBalance(tokenAmount.token, address(this));

        if (tokenAmount.amount == DELIMITER) {
            return balance;
        }

        return (balance * tokenAmount.amount) / DELIMITER;
    }
}
