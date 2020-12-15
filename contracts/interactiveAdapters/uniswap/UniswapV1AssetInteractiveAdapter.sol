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

import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { Exchange } from "../../interfaces/Exchange.sol";
import { Factory } from "../../interfaces/Factory.sol";

/**
 * @title Interactive adapter for Uniswap V1 protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV1AssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;

    /**
     * @notice Deposits tokens to the Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * ETH and token addresses, ETH and token amounts to be deposited, and amount types.
     * @return tokensToBeWithdrawn Array with tokens sent back.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 2, "ULIA: should be 2 tokenAmounts");
        require(tokenAmounts[0].token == ETH, "ULIA: should be ETH");
        address exchange = Factory(FACTORY).getExchange(tokenAmounts[1].token);
        require(exchange != address(0), "ULIA: no exchange");

        address token = tokenAmounts[1].token;
        uint256 ethAmount = getAbsoluteAmountDeposit(tokenAmounts[0]);
        uint256 tokenAmount = getAbsoluteAmountDeposit(tokenAmounts[1]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = exchange;
        tokensToBeWithdrawn[1] = token;

        ERC20(token).safeApprove(exchange, tokenAmount, "ULIA[1]");

        try
            Exchange(exchange).addLiquidity{ value: ethAmount }(
                uint256(1),
                tokenAmount,
                // solhint-disable-next-line not-rely-on-time
                block.timestamp + 1
            )
        returns (uint256 addedLiquidity) {
            require(addedLiquidity > 0, "ULIA: deposit fail[1]");
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULIA: deposit fail[2]");
        }

        ERC20(token).safeApprove(exchange, 0, "ULIA[2]");
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * UNI token address, UNI token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with on element - underlying token.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "ULIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = Factory(FACTORY).getToken(token);
        tokensToBeWithdrawn[1] = ETH;

        try
            Exchange(token).removeLiquidity(
                amount,
                uint256(1),
                uint256(1),
                // solhint-disable-next-line not-rely-on-time
                block.timestamp + 1
            )
        {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("ULIA: withdraw fail");
        }
    }
}
