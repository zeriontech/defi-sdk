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

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { UniswapV1LiquidityAdapter } from "../../adapters/uniswap/UniswapV1LiquidityAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev Exchange contract interface.
 * Only the functions required for UniswapV1LiquidityAdapter contract are added.
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
 * Only the functions required for UniswapV1LiquidityAdapter contract are added.
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
contract UniswapV1LiquidityInteractiveAdapter is InteractiveAdapter, UniswapV1LiquidityAdapter {

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
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 2, "ULIA: should be 2 tokens/amounts/types!");
        require(tokens[0] == ETH, "ULIA: should be ETH!");
        address exchange = Factory(FACTORY).getExchange(tokens[1]);
        require(exchange != address(0), "ULIA: no exchange!");

        uint256 ethAmount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);
        uint256 tokenAmount = getAbsoluteAmountDeposit(tokens[1], amounts[1], amountTypes[1]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = exchange;
        tokensToBeWithdrawn[1] = tokens[1];

        ERC20(tokens[1]).safeApprove(exchange, tokenAmount, "ULIA![1]");
        try Exchange(exchange).addLiquidity.value(ethAmount)(
            uint256(1),
            tokenAmount,
            // solhint-disable-next-line not-rely-on-time
            now + 1
        ) returns (uint256 addedLiquidity) {
            require(addedLiquidity > 0, "ULIA: deposit fail![1]");
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("ULIA: deposit fail![2]");
        }

        ERC20(tokens[1]).safeApprove(exchange, 0, "ULIA![2]");
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
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "ULIA: should be 1 token/amount/type!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = Factory(FACTORY).getToken(tokens[0]);

        try Exchange(tokens[0]).removeLiquidity(
            amount,
            uint256(1),
            uint256(1),
            // solhint-disable-next-line not-rely-on-time
            now + 1
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch (bytes memory) {
            revert("ULIA: withdraw fail!");
        }
    }
}
