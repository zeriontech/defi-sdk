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

pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount, AmountType } from "../../shared/Structs.sol";
import { UniswapExchangeAdapter } from "../../adapters/uniswap/UniswapExchangeAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev Exchange contract interface.
 * Only the functions required for UniswapV1ExchangeInteractiveAdapter contract are added.
 * The Exchange contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy.
 */
interface Exchange {
    function ethToTokenSwapInput(
        uint256,
        uint256
    )
        external
        payable
        returns (uint256);
    function tokenToEthSwapInput(
        uint256,
        uint256,
        uint256
    )
        external
        returns (uint256);
    function tokenToTokenSwapInput(
        uint256,
        uint256,
        uint256,
        uint256,
        address
    )
        external
        returns (uint256);
    function ethToTokenSwapOutput(
        uint256,
        uint256
    )
        external
        payable
        returns (uint256);
    function tokenToEthSwapOutput(
        uint256,
        uint256,
        uint256
    )
        external
        returns (uint256);
    function tokenToTokenSwapOutput(
        uint256,
        uint256,
        uint256,
        uint256,
        address
    )
        external
        returns (uint256);
}


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapV1ExchangeInteractiveAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getExchange(address) external view returns (address);
}


/**
 * @title Interactive adapter for Uniswap V1 protocol (exchange).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV1ExchangeInteractiveAdapter is InteractiveAdapter, UniswapExchangeAdapter {
    using SafeERC20 for ERC20;

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param tokens Array with one element - token address to be exchanged from.
     * @param amounts Array with one element - token amount to be exchanged from.
     * @param amountTypes Array with one element - amount type.
     * @param data Token address to be exchanged to (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be exchanged to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        TokenAmount[] memory tokenAmounts,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "UEIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);
        address toToken = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toToken;

        if (token == ETH) {
            address exchange = Factory(FACTORY).getExchange(toToken);
            require(exchange != address(0), "UEIA: no exchange[1]");

            try Exchange(exchange).ethToTokenSwapInput{value: amount}(
                uint256(1),
                // solhint-disable-next-line not-rely-on-time
                now
            ) returns (uint256) { // solhint-disable-line no-empty-blocks
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("UEIA: deposit fail[2]");
            }
        } else {
            address exchange = Factory(FACTORY).getExchange(token);
            require(exchange != address(0), "UEIA: no exchange[2]");

            ERC20(token).safeApprove(exchange, amount, "UEIA[1]");

            if (toToken == ETH) {
                try Exchange(exchange).tokenToEthSwapInput(
                    amount,
                    uint256(1),
                    // solhint-disable-next-line not-rely-on-time
                    now
                ) returns (uint256) { // solhint-disable-line no-empty-blocks
                } catch Error(string memory reason) {
                    revert(reason);
                } catch {
                    revert("UEIA: deposit fail[3]");
                }
            } else {
                try Exchange(exchange).tokenToTokenSwapInput(
                    amount,
                    uint256(1),
                    uint256(1),
                    // solhint-disable-next-line not-rely-on-time
                    now,
                    toToken
                ) returns (uint256) { // solhint-disable-line no-empty-blocks
                } catch Error(string memory reason) {
                    revert(reason);
                } catch {
                    revert("UEIA: deposit fail[4]");
                }
            }
        }
    }

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param tokens Array with one element - token address to be exchanged to.
     * @param amounts Array with one element - token amount to be exchanged to.
     * @param amountTypes Array with one element - amount type (can be `AmountType.Absolute` only).
     * @param data Token address to be exchanged from (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be changed to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        TokenAmount[] memory tokenAmounts,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "UEIA: should be 1 tokenAmount");
        require(tokenAmounts[0].amountType == AmountType.Absolute, "UEIA: bad type");

        address token = tokenAmounts[0].token;
        address fromToken = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = token;

        if (fromToken == ETH) {
            address exchange = Factory(FACTORY).getExchange(token);
            require(exchange != address(0), "UEIA: no exchange[1]");

            try Exchange(exchange).ethToTokenSwapOutput{value: address(this).balance}(
                tokenAmounts[0].amount,
                // solhint-disable-next-line not-rely-on-time
                now
            ) returns (uint256) { // solhint-disable-line no-empty-blocks
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("UEIA: withdraw fail[1]");
            }
        } else {
            address exchange = Factory(FACTORY).getExchange(fromToken);
            require(exchange != address(0), "UEIA: no exchange[2]");

            uint256 balance = ERC20(fromToken).balanceOf(address(this));
            ERC20(fromToken).safeApprove(exchange, balance, "UEIA[2]");

            if (token == ETH) {
                try Exchange(exchange).tokenToEthSwapOutput(
                    tokenAmounts[0].amount,
                    balance,
                    // solhint-disable-next-line not-rely-on-time
                    now
                ) returns (uint256) { // solhint-disable-line no-empty-blocks
                } catch Error(string memory reason) {
                    revert(reason);
                } catch {
                    revert("UEIA: withdraw fail[2]");
                }
            } else {
                try Exchange(exchange).tokenToTokenSwapOutput(
                    tokenAmounts[0].amount,
                    balance,
                    type(uint256).max,
                    // solhint-disable-next-line not-rely-on-time
                    now,
                    token
                ) returns (uint256) { // solhint-disable-line no-empty-blocks
                } catch Error(string memory reason) {
                    revert(reason);
                } catch {
                    revert("UEIA: withdraw fail[3]");
                }
            }
            ERC20(fromToken).safeApprove(exchange, 0, "UEIA[3]");
        }
    }
}
