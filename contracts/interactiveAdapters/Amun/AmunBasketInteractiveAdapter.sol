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

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { AmunBasket } from "../../interfaces/AmunBasket.sol";

/**
 * @title Interactive adapter for AmunBasket.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Timo <Timo@amun.com>
 */
contract AmunBasketInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;
    uint16 internal constant REFERRAL_CODE = 101;

    /**
     * @notice Deposits tokens to the AmunBasket.
     * @param tokenAmounts Array of underlying TokenAmounts - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - basket - AmunBasket address.
     * @return tokensToBeWithdrawn Array with one element - AmunBasket address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        address basket = abi.decode(data, (address));
        require(
            tokenAmounts.length == AmunBasket(basket).getTokens().length,
            "LBIA: should be equal tokenAmount"
        );
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = basket;

        uint256 amount = getBasketAmount(basket, tokenAmounts);
        approveTokens(basket, tokenAmounts);

        try AmunBasket(basket).joinPool(amount, REFERRAL_CODE)  {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("LBIA: join fail");
        }
    }

    /**
     * @notice Withdraws tokens from the AmunBasket.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * AmunBasket token address, AmunBasket token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with amun token underlying.
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
        tokensToBeWithdrawn = AmunBasket(basket).getTokens();

        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        try AmunBasket(basket).exitPool(amount, REFERRAL_CODE)  {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("LBIA: exit fail");
        }
    }

    function getBasketAmount(address basket, TokenAmount[] calldata tokenAmounts)
        internal
        view
        returns (uint256)
    {
        uint256 totalSupply = ERC20(basket).totalSupply() +
            AmunBasket(basket).calcOutStandingAnnualizedFee();
        uint256 entryFee = AmunBasket(basket).getEntryFee();
        uint256 minimumBasketAmount = type(uint256).max;
        uint256 tempAmount;
        for (uint256 i = 0; i < tokenAmounts.length; i++) {
            uint256 tokenBalance = ERC20(tokenAmounts[i].token).balanceOf(basket);

            tempAmount = tokenAmounts[i].amount - (mul(tokenAmounts[i].amount, entryFee) / 10**18);
            tempAmount = mul(tempAmount, totalSupply) / tokenBalance;

            if (tempAmount < minimumBasketAmount) {
                minimumBasketAmount = tempAmount;
            }
        }

        return minimumBasketAmount;
    }

    function approveTokens(address basket, TokenAmount[] calldata tokenAmounts) internal {
        uint256 length = tokenAmounts.length;

        for (uint256 i = 0; i < length; i++) {
            ERC20(tokenAmounts[i].token).safeApproveMax(basket, getAbsoluteAmountDeposit(tokenAmounts[i]), "LBIA[2]");
        }
    }
    
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "LBIA: mul overflow");

        return c;
    }
}
