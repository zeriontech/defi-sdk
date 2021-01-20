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
import { Mooniswap } from "../../interfaces/Mooniswap.sol";

/**
 * @title Interactive adapter for 1inch Liquidity Protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract OneInchLPAssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Mooniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameter:
     *     - pool - pool address.
     * @return tokensToBeWithdrawn Array with one element - 1LP-token (pool) address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 2, "OILPAIA: should be 2 tokenAmounts");

        address pool = abi.decode(data, (address));
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pool;

        uint256 amount0 = getAbsoluteAmountDeposit(tokenAmounts[0]);
        uint256 amount1 = getAbsoluteAmountDeposit(tokenAmounts[1]);

        uint256 value = 0;
        if (tokenAmounts[0].token == ETH) {
            value = amount0;
        } else {
            ERC20(tokenAmounts[0].token).safeApproveMax(pool, amount0, "OILPAIA[1]");
        }
        if (tokenAmounts[1].token == ETH) {
            value = amount1;
        } else {
            ERC20(tokenAmounts[1].token).safeApproveMax(pool, amount1, "OILPAIA[2]");
        }

        try
            Mooniswap(pool).deposit{ value: value }([amount0, amount1], [uint256(0), uint256(0)])
        returns (uint256, uint256[2] memory) {} catch Error(string memory reason) {
            // solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("OILPAIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * UNI token address, UNI token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with two elements - underlying tokens.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "OILPAIA: should be 1 tokenAmount");
        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = Mooniswap(token).getTokens();
        for (uint256 i = 0; i < tokensToBeWithdrawn.length; i++) {
            if (tokensToBeWithdrawn[i] == address(0)) {
                tokensToBeWithdrawn[i] = ETH;
            }
        }

        try Mooniswap(token).withdraw(amount, new uint256[](0)) returns (
            uint256[2] memory
        ) {} catch Error(string memory reason) {
            // solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("OILPAIA: withdraw fail");
        }
    }
}
