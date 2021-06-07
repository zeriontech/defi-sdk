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
import { AmunLendingToken } from "../../interfaces/AmunLendingToken.sol";
import { AmunLendingTokenStorage } from "../../interfaces/AmunLendingTokenStorage.sol";
import { AmunAddressStorage } from "../../interfaces/AmunAddressStorage.sol";

/**
 * @title Interactive adapter for AmunBasket.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Timo <Timo@amun.com>
 */
contract AmunLendingInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the AmunBasket.
     * @param tokenAmounts Array of underlying TokenAmounts - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - lendingToken - AmunBasket address.
     * @return tokensToBeWithdrawn Array with one element - rebalancing set address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "LBIA[1]: should be 1 tokenAmount");

        address lendingToken = abi.decode(data, (address));
        require(
            tokenAmounts[0].token == getUnderlyingStablecoin(lendingToken),
            "LBIA: should be underling stablecoin"
        );

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = lendingToken;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);
        ERC20(tokenAmounts[0].token).safeApprove(lendingToken, amount, "LBIA[1]");
        try
            AmunLendingToken(lendingToken).create(
                tokenAmounts[0].token,
                amount,
                address(this),
                0,
                101
            )
         {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("LBIA: join fail");
        }
    }

    /**
     * @notice Withdraws tokens from the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * AmunBasket token address, AmunBasket token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with amun token underlying.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "LBIA[2]: should be 1 tokenAmount");
        address lendingToken = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = getUnderlyingStablecoin(lendingToken);

        try
            AmunLendingToken(lendingToken).redeem(
                tokensToBeWithdrawn[0],
                amount,
                address(this),
                0,
                101
            )
         {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("LBIA: exit fail");
        }
    }

    function getUnderlyingStablecoin(address lendingToken) internal view returns (address) {
        address underlyingToken = AmunLendingTokenStorage(
            AmunLendingToken(lendingToken).limaTokenHelper()
        )
            .currentUnderlyingToken();
        address limaSwap = AmunLendingTokenStorage(
            AmunLendingToken(lendingToken).limaTokenHelper()
        )
            .limaSwap();
        return AmunAddressStorage(limaSwap).interestTokenToUnderlyingStablecoin(underlyingToken);
    }
}
