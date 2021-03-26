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

import { ProtocolAdapter } from "../protocolAdapters/ProtocolAdapter.sol";
import { TokenAmount, AmountType } from "../shared/Structs.sol";
import { ERC20 } from "../interfaces/ERC20.sol";

/**
 * @title Base contract for interactive protocol adapters.
 * @dev deposit() and withdraw() functions MUST be implemented
 *     as well as all the functions from ProtocolAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract InteractiveAdapter is ProtocolAdapter {
    uint256 internal constant DELIMITER = 1e18;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @dev The function must deposit assets to the protocol.
     * @return MUST return assets to be sent back to the `msg.sender`.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        virtual
        returns (address[] memory);

    /**
     * @dev The function must withdraw assets from the protocol.
     * @return MUST return assets to be sent back to the `msg.sender`.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        virtual
        returns (address[] memory);

    /**
     * @dev MUST be used only in `deposit()` function.
     * @param tokenAmount TokenAmount struct with
     *     token address, amount, and amount type.
     * @return Absolute amount given TokenAmount struct.
     */
    function getAbsoluteAmountDeposit(TokenAmount calldata tokenAmount)
        internal
        view
        virtual
        returns (uint256)
    {
        AmountType amountType = tokenAmount.amountType;

        require(
            amountType == AmountType.Relative || amountType == AmountType.Absolute,
            "IA: bad amount type"
        );

        if (amountType == AmountType.Absolute) {
            return tokenAmount.amount;
        }

        require(tokenAmount.amount <= DELIMITER, "IA: bad amount");

        uint256 balance =
            (tokenAmount.token == ETH)
                ? address(this).balance
                : ERC20(tokenAmount.token).balanceOf(address(this));

        if (tokenAmount.amount == DELIMITER) {
            return balance;
        }

        return (balance * tokenAmount.amount) / DELIMITER;
    }

    /**
     * @dev MUST be used only in `withdraw()` function.
     * @param tokenAmount TokenAmount struct with
     *     token address, amount, and amount type.
     * @return Absolute amount given TokenAmount struct.
     */
    function getAbsoluteAmountWithdraw(TokenAmount calldata tokenAmount)
        internal
        virtual
        returns (uint256)
    {
        AmountType amountType = tokenAmount.amountType;
        // TODO consider using uint256 amount = tokenAmount.amount

        require(
            amountType == AmountType.Relative || amountType == AmountType.Absolute,
            "IA: bad amount type"
        );

        if (amountType == AmountType.Absolute) {
            return tokenAmount.amount;
        }

        require(tokenAmount.amount <= DELIMITER, "IA: bad amount");

        int256 balanceSigned = getBalance(tokenAmount.token, address(this));
        uint256 balance = balanceSigned > 0 ? uint256(balanceSigned) : uint256(-balanceSigned);

        if (tokenAmount.amount == DELIMITER) {
            return balance;
        }

        return (balance * tokenAmount.amount) / DELIMITER;
    }
}
