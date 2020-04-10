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

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { UniswapV1Adapter } from "../../adapters/uniswap/UniswapV1Adapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev Exchange contract interface.
 * Only the functions required for UniswapV1InteractiveAdapter contract are added.
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
 * Only the functions required for UniswapV1InteractiveAdapter contract are added.
 * The Factory contract is available here
 * github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy.
 */
interface Factory {
    function getExchange(address) external view returns (address);
    function getToken(address) external view returns (address);
}


/**
 * @title Adapter for Uniswap V1 protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV1InteractiveAdapter is InteractiveAdapter, UniswapV1Adapter {

    using SafeERC20 for ERC20;

    address internal constant FACTORY = 0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95;

    /**
     * @notice Deposits tokens to the Uniswap pool.
     * @param tokens Array with one element - token address.
     * @param amounts Array with one element - token amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @return Asset sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] calldata tokens,
        uint256[] calldata amounts,
        AmountType[] calldata amountTypes,
        bytes calldata
    )
        external
        payable
        override
        returns (address[] memory)
    {
        require(tokens.length == 2, "UIA: should be 2 tokens!");
        require(amounts.length == 2,  "UIA: should be 2 amounts!");
        require(amountTypes.length == 2,  "UIA: should be 2 types!");
        require(tokens[0] == ETH, "UIA: should be ETH!");
        address exchange = Factory(FACTORY).getExchange(tokens[1]);
        require(exchange != address(0), "UIA: no exchange!");

        uint256 ethAmount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);
        uint256 tokenAmount = getAbsoluteAmountDeposit(tokens[1], amounts[1], amountTypes[1]);

        address[] memory tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = exchange;
        tokensToBeWithdrawn[1] = tokens[1];

        ERC20(tokens[1]).safeApprove(exchange, tokenAmount);
        require(
            Exchange(exchange).addLiquidity.value(ethAmount)(
                uint256(1),
                tokenAmount,
                // solhint-disable-next-line not-rely-on-time
                now + 1 hours
            ) > 0,
            "UIA: deposit failed!"
        );
        ERC20(tokens[1]).safeApprove(exchange, 0);

        return tokensToBeWithdrawn;
    }

    /**
     * @notice Withdraws tokens from the Compound protocol.
     * @param tokens Array with one element - exchange address.
     * @param amounts Array with one element - UNI-token amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return Asset sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] calldata tokens,
        uint256[] calldata amounts,
        AmountType[] calldata amountTypes,
        bytes calldata
    )
        external
        payable
        override
        returns (address[] memory)
    {
        require(tokens.length == 1, "UIA: should be 1 token!");
        require(amounts.length == 1, "UIA: should be 1 amount!");
        require(amountTypes.length == 1,  "UIA: should be 1 type!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        address[] memory tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = Factory(FACTORY).getToken(tokens[0]);

        Exchange(tokens[0]).removeLiquidity(
            amount,
            uint256(1),
            uint256(1),
            // solhint-disable-next-line not-rely-on-time
            now + 1 hours
        );

        return tokensToBeWithdrawn;
    }
}
