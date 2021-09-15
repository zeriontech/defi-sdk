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
import { TokenAmount, AmountType } from "../../shared/Structs.sol";
import { UniswapExchangeAdapter } from "../../adapters/uniswap/UniswapExchangeAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { ISwapRouter } from "../../interfaces/ISwapRouter.sol";

/**
 * @title Interactive adapter for Uniswap V3 protocol (exactInput).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV3ExchangeInteractiveAdapter is InteractiveAdapter, UniswapExchangeAdapter {
    using SafeERC20 for ERC20;

    address internal constant SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

    /**
     * @notice Exchange tokens using Uniswap v3 SwapRouter.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * "from" token address, "from" token amount, and amount type.
     * @param data Uniswap v3 exchange path & out address.
     * @return tokensToBeWithdrawn Array with one element - token address to be exchanged to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "Uv3EIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        bytes memory path;
        tokensToBeWithdrawn = new address[](1);
        (path, tokensToBeWithdrawn[0]) = abi.decode(data, (bytes, address));

        ERC20(token).safeApproveMax(SWAP_ROUTER, amount, "Uv3EIA");

        try
            ISwapRouter(SWAP_ROUTER).exactInput(
                ISwapRouter.ExactInputParams({
                    path: path,
                    recipient: address(this),
                    // solhint-disable-next-line not-rely-on-time
                    deadline: block.timestamp,
                    amountIn: amount,
                    amountOutMinimum: 0
                })
            )
        returns (uint256) {
            // solhint-disable-previous-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("Uv3EIA: swap fail");
        }
    }

    /**
     * @notice Withdraw functionality is not supported, yet. However, it's possible to implement.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata, bytes calldata)
        external
        payable
        override
        returns (address[] memory)
    {
        revert("Uv3EIA: no withdraw");
    }
}
