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

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { IAmunBasket } from "../../interfaces/AmunBasket.sol";

/**
 * @title Interactive adapter for AmunBasket.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Timo <Timo@amun.com>
 */
contract AmunBasketInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the AmunBasket.
     * @param tokenAmounts Array of underlying TokenAmounts - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - basket - AmunBasket address.
     *     - amount - AmunBasket amount to mint.
     * @return tokensToBeWithdrawn Array with one element - rebalancing set address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        uint256 amount;
        address basket;

        (basket, amount) = abi.decode(data, (address, uint256));
        require(
            tokenAmounts.length == IAmunBasket(basket).getTokens().length,
            "LBIA: should be equal tokenAmount"
        );
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = basket;

        for (uint256 i = 0; i < tokenAmounts.length; i++) {
            ERC20(tokenAmounts[i].token).safeApprove(
                basket,
                getAbsoluteAmountDeposit(tokenAmounts[i]),
                "LBIA[1]"
            );
        }

        try IAmunBasket(basket).joinPool(amount, 101)  {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("LBIA: join fail");
        }
    }

    /**
     * @notice Withdraws tokens from the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * AmunBasket token address, AmunBasket token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with lima token underlying.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "LBIA: should be 1 tokenAmount");
        address basket = tokenAmounts[0].token;
        tokensToBeWithdrawn = IAmunBasket(basket).getTokens();

        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        try IAmunBasket(basket).exitPool(amount, 101)  {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("LBIA: exit fail");
        }
    }
}
