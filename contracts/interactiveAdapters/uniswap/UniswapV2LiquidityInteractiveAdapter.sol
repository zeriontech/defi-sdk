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
import { Action, AmountType } from "../../Structs.sol";
import { UniswapV2LiquidityAdapter } from "../../adapters/uniswap/UniswapV2LiquidityAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev UniswapV2Pair contract interface.
 * Only the functions required for UniswapV2LiquidityInteractiveAdapter contract are added.
 * The UniswapV2Pair contract is available here
 * github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2Pair.sol.
 */
interface UniswapV2Pair {
    function mint(address) external returns (uint256);
    function burn(address) external returns (uint256, uint256);
    function token0() external view returns (address);
    function token1() external view returns (address);
}


/**
 * @title Interactive adapter for Uniswap V2 protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2LiquidityInteractiveAdapter is InteractiveAdapter, UniswapV2LiquidityAdapter {

    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Uniswap pool (pair).
     * @param data ABI-encoded additional parameters:
     *     - pairAddress - pair address;
     *     - pairQuantity - pair amount to be minted.
     * @return tokensToBeWithdrawn Array with tokens sent back.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory,
        uint256[] memory,
        AmountType[] memory,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        (address pairAddress, uint256 pairQuantity) = abi.decode(data, (address, uint256));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pairAddress;

        address token0 = UniswapV2Pair(pairAddress).token0();
        address token1 = UniswapV2Pair(pairAddress).token1();
        uint256 totalSupply = ERC20(pairAddress).totalSupply();

        ERC20(token0).safeTransfer(
            pairAddress,
            pairQuantity * ERC20(token0).balanceOf(pairAddress) / totalSupply + 1,
            "ULIA![1]"
        );
        ERC20(token1).safeTransfer(
            pairAddress,
            pairQuantity * ERC20(token1).balanceOf(pairAddress) / totalSupply + 1,
            "ULIA![2]"
        );
        try UniswapV2Pair(pairAddress).mint(
            address(this)
        ) returns (uint256 addedLiquidity) {
            require(addedLiquidity >= pairQuantity, "ULIA: not enough!");
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("ULIA: deposit fail!");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokens Array with one element - UNI-token (pair) address.
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
        require(tokens.length == 1, "ULIA: should be 1 token!");
        require(tokens.length == amounts.length, "ULIA: inconsistent arrays!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = UniswapV2Pair(tokens[0]).token0();
        tokensToBeWithdrawn[1] = UniswapV2Pair(tokens[0]).token1();

        ERC20(tokens[0]).safeTransfer(tokens[0], amount, "ULIA![3]");

        try UniswapV2Pair(tokens[0]).burn(
            address(this)
        ) returns (uint256, uint256) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("ULIA: withdraw fail!");
        }
    }
}
