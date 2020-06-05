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
import { Logic } from "../../Logic.sol";
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
    function token0() external view returns (address);
    function token1() external view returns (address);
}


/**
 * @title Interactive adapter for Uniswap V2 protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2LiquidityZapInteractiveAdapter is InteractiveAdapter, UniswapV2LiquidityAdapter {

    using SafeERC20 for ERC20;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Deposits tokens to the Uniswap pool (pair).
     * @param tokens Array with one element - token address to be deposited.
     * @param amounts Array with one element - token amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @param data ABI-encoded additional parameters:
     *     - pairAddress - pair address.
     * @return tokensToBeWithdrawn Array with tokens sent back.
     * @dev Implementation of InteractiveAdapter function.
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
        require(tokens.length == 1, "ULZIA: should be 1 tokens!");
        require(tokens.length == amounts.length, "ULZIA: inconsistent arrays!");

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);
        address pairAddress = abi.decode(data, (address));
        address token0 = UniswapV2Pair(pairAddress).token0();
        address token1 = UniswapV2Pair(pairAddress).token1();

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pairAddress;

        if (token0 != tokens[0]) {
            executeSwapAction(tokens[0], token0, amount / 2);
        }

        if (token1 != tokens[0]) {
            executeSwapAction(tokens[0], token1, amount - amount / 2);
        }

        ERC20(token0).safeTransfer(
            pairAddress,
            ERC20(token0).balanceOf(address(this)),
            "ULZIA![1]"
        );
        ERC20(token1).safeTransfer(
            pairAddress,
            ERC20(token1).balanceOf(address(this)),
            "ULZIA![2]"
        );
        try UniswapV2Pair(pairAddress).mint(
            address(this)
        ) returns (uint256) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULZIA: deposit fail!");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokens Array with one element - UNI-token (pair) address.
     * @param amounts Array with one element - UNI-token amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @param data Address of the withdrawal token (ABI-encoded).
     * @return tokensToBeWithdrawn Array with on element - underlying token.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
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
        require(tokens.length == 1, "ULZIA: should be 1 token!");
        require(tokens.length == amounts.length, "ULZIA: inconsistent arrays!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);
        address toToken = abi.decode(data, (address));
        address token0 = UniswapV2Pair(tokens[0]).token0();
        address token1 = UniswapV2Pair(tokens[0]).token1();

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toToken;

        ERC20(tokens[0]).safeTransfer(tokens[0], amount, "ULZIA![3]");

        try UniswapV2Pair(tokens[0]).burn(
            address(this)
        ) returns (uint256 amount0, uint256 amount1) {
            if (token0 != toToken) {
                executeSwapAction(token0, toToken, amount0);
            }
            if (token1 != toToken) {
                executeSwapAction(token1, toToken, amount1);
            }
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULZIA: withdraw fail!");
        }
    }

    function executeSwapAction(
        address fromToken,
        address toToken,
        uint256 amount
    )
        internal
    {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        AmountType[] memory amountTypes = new AmountType[](1);
        amountTypes[0] = AmountType.Absolute;

        address[] memory path;
        if (fromToken == WETH || toToken == WETH) {
            path = new address[](2);
            path[0] = fromToken;
            path[1] = toToken;
        } else {
            path = new address[](3);
            path[0] = fromToken;
            path[1] = WETH;
            path[2] = toToken;
        }

        try Logic(payable(address(this))).executeActionExternal(
            Action({
                actionType: ActionType.Deposit,
                protocolName: "Uniswap V2",
                adapterIndex: 2,
                tokens: new address[](0),
                amounts: amounts,
                amountTypes: amountTypes,
                data: abi.encode(path)
            })
        ) returns (address[] memory) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ULZIA: swap fail!");
        }
    }
}
