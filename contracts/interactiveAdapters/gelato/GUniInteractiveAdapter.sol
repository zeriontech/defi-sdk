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
import { IGUniPool } from "../../interfaces/IGUniPool.sol";

/**
 * @title Interactive adapter for G-UNI protocol (fungible lp tokens on Uniswap v3).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author kassandra.eth <ari@gelato.digital>
 */
contract GUniInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the G-UNI position (on Uniswap V3 pair).
     * @param tokenAmounts Array with two element - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - pair - pair address.
     * @return tokensToBeWithdrawn Array with one element - G-UNI-token (pair) address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 2, "GUIA: should be 2 tokenAmounts");

        address pair = abi.decode(data, (address));
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pair;

        uint256 amount0Max = getAbsoluteAmountDeposit(tokenAmounts[0]);
        uint256 amount1Max = getAbsoluteAmountDeposit(tokenAmounts[1]);

        (uint256 amount0, uint256 amount1, uint256 mintAmount) = IGUniPool(pair).getMintAmounts(
            amount0Max,
            amount1Max
        );

        ERC20(tokenAmounts[0].token).safeApprove(pair, amount0, "GUIA[1]");
        ERC20(tokenAmounts[1].token).safeApprove(pair, amount1, "GUIA[2]");

        // solhint-disable-next-line no-empty-blocks
        try IGUniPool(pair).mint(mintAmount, address(this)) returns (
            uint256,
            uint256,
            uint128
        ) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("GUIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * G-UNI token address, G-UNI token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with ONE OR TWO elements - underlying tokens (that are non-zero).
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "GUIA: should be 1 tokenAmount");

        address pair = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        // solhint-disable-next-line no-empty-blocks
        try IGUniPool(pair).burn(amount, address(this)) returns (
            uint256 amount0,
            uint256 amount1,
            uint128
        ) {
            require(amount0 > 0 || amount1 > 0, "GUIA: received 0 tokens on burn");
            if (amount0 > 0 && amount1 > 0) {
                tokensToBeWithdrawn = new address[](2);
                tokensToBeWithdrawn[0] = IGUniPool(pair).token0();
                tokensToBeWithdrawn[1] = IGUniPool(pair).token1();
            } else if (amount1 == 0) {
                tokensToBeWithdrawn = new address[](1);
                tokensToBeWithdrawn[0] = IGUniPool(pair).token0();
            } else {
                tokensToBeWithdrawn = new address[](1);
                tokensToBeWithdrawn[0] = IGUniPool(pair).token1();
            }
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("GUIA: withdraw fail");
        }
    }
}
