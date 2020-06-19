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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType, ActionType } from "../../Structs.sol";
import { Core } from "../../Core.sol";
import { UniswapV2LiquidityAdapter } from "../../adapters/uniswap/UniswapV2LiquidityAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev UniswapV2Pair contract interface.
 * Only the functions required for UniswapV2LiquidityZapInteractiveAdapter contract are added.
 * The UniswapV2Pair contract is available here
 * github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2Pair.sol.
 */
interface UniswapV2Pair {
    function mint(address) external returns (uint256);
    function burn(address) external returns (uint256, uint256);
    function getReserves() external view returns (uint112, uint112);
    function token0() external view returns (address);
    function token1() external view returns (address);
}


/**
 * @title Interactive adapter for Uniswap V2 protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2LiquidityInputInteractiveAdapter is InteractiveAdapter,
UniswapV2LiquidityAdapter {

    using SafeERC20 for ERC20;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Deposits tokens to the Uniswap pool (pair).
     * @param tokens Array with two elements - token addresses to be deposited.
     * @param amounts Array with two elements - token amounts to be deposited.
     * @param amountTypes Array with two elements - amount types.
     * @param data ABI-encoded additional parameters:
     *     - pairAddress - pair address.
     * @return tokensToBeWithdrawn Array with one element - UNI-token (pair) address.
     * @dev Implementation of InteractiveAdapter function.
     * TODO implement perfect amounts calculation
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 2, "ULIIA: should be 2 tokens!");
        require(tokens.length == amounts.length, "ULIIA: inconsistent arrays!");

        address pairAddress = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pairAddress;

        uint256 amount0 = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);
        uint256 amount1 = getAbsoluteAmountDeposit(tokens[1], amounts[1], amountTypes[1]);

        uint256 reserve0;
        uint256 reserve1;
        if (tokens[0] == UniswapV2Pair(pairAddress).token0()) {
            (reserve0, reserve1) = UniswapV2Pair(pairAddress).getReserves();
        } else {
            (reserve1, reserve0) = UniswapV2Pair(pairAddress).getReserves();
        }

        uint256 amount1Optimal = amount0 * reserve1 / reserve0;
        if (amount1Optimal < amount1) {
            amount1 = amount1Optimal;
        } else if (amount1Optimal > amount1) {
            amount0 = amount1 * reserve0 / reserve1;
        }

        ERC20(tokens[0]).safeTransfer(pairAddress, amount0, "ULIIA![1]");
        ERC20(tokens[1]).safeTransfer(pairAddress, amount1, "ULIIA![2]");

        try UniswapV2Pair(pairAddress).mint(
            address(this)
        ) returns (uint256) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULIIA: deposit fail!");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokens Array with one element - UNI-token (pair) address.
     * @param amounts Array with one element - UNI-token (pair) amount.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with two elements - underlying tokens.
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
        require(tokens.length == 1, "ULIIA: should be 1 token!");
        require(tokens.length == amounts.length, "ULIIA: inconsistent arrays!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = UniswapV2Pair(tokens[0]).token0();
        tokensToBeWithdrawn[1] = UniswapV2Pair(tokens[0]).token1();

        ERC20(tokens[0]).safeTransfer(tokens[0], amount, "ULIIA![3]");

        try UniswapV2Pair(tokens[0]).burn(
            address(this)
        ) returns (uint256, uint256) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULIIA: withdraw fail!");
        }
    }
}
