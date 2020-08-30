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
import { TokenAmount } from "../../shared/Structs.sol";
import { UniswapV1AssetAdapter } from "../../adapters/uniswap/UniswapV1AssetAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev Exchange contract interface.
 * Only the functions required for UniswapV1AssetInteractiveAdapter contract are added.
 * The Exchange contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy.
 */
interface Exchange {
    function addLiquidity(
        uint256,
        uint256,
        uint256
    )
        external
        payable
        returns (uint256);
    function removeLiquidity(
        uint256,
        uint256,
        uint256,
        uint256
    )
        external
        returns (uint256, uint256);
}


/**
 * @dev Factory contract interface.
 * Only the functions required for UniswapV1AssetInteractiveAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getExchange(address) external view returns (address);
    function getToken(address) external view returns (address);
}


/**
 * @title Interactive adapter for Uniswap V1 protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV1AssetInteractiveAdapter is InteractiveAdapter, UniswapV1AssetAdapter {
    using SafeERC20 for ERC20;

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;

    /**
     * @notice Deposits tokens to the Uniswap pool.
     * @param tokens Array with two elements - 0xEeee...EEeE and token address.
     * @param amounts Array with two elements - ETH and token amounts to be deposited.
     * @param amountTypes Array with two elements - amount types.
     * @return tokensToBeWithdrawn Array with tokens sent back.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        TokenAmount[] memory tokenAmounts,
        bytes memory
    )
        public
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

        try Exchange(exchange).addLiquidity{value: ethAmount}(
            uint256(1),
            tokenAmount,
            // solhint-disable-next-line not-rely-on-time
            now + 1
        ) returns (uint256 addedLiquidity) {
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
     * @param tokens Array with one element - UNI-token (exchange) address.
     * @param amounts Array with one element - UNI-token amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with on element - underlying token.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        TokenAmount[] memory tokenAmounts,
        bytes memory
    )
        public
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

        try Exchange(token).removeLiquidity(
            amount,
            uint256(1),
            uint256(1),
            // solhint-disable-next-line not-rely-on-time
            now + 1
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch {
            revert("ULIA: withdraw fail");
        }
    }
}
