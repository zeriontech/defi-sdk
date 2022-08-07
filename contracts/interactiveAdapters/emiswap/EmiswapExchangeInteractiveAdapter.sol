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

pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount, AmountType } from "../../shared/Structs.sol";
import { EmiswapExchangeAdapter } from "../../adapters/emiswap/EmiswapExchangeAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import "../../interfaces/IEmiRouter.sol";

/**
 * @title Interactive adapter for Emiswap protocol (exchange).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Eugene Rupakov <eugene.rupakov@emirex.com>
 */
contract EmiswapExchangeInteractiveAdapter is InteractiveAdapter, EmiswapExchangeAdapter {
    using SafeERC20 for ERC20;

    address internal constant ROUTER = 0xf164fC0Ec4E93095b804a4795bBe1e041497b92a;

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * "from" token address, "from" token amount, and amount type.
     * @param data Uniswap exchange path starting from tokens[0] (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be exchanged to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "EEIA: should be 1 tokenAmount");

        address[] memory path = abi.decode(data, (address[]));
        address token = tokenAmounts[0].token;
        require(token == path[0], "EEIA: bad path[0]");
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = path[path.length - 1];

        ERC20(token).safeApprove(ROUTER, amount, "EEIA[1]");

        try
            IEmiRouter(ROUTER).swapExactTokensForTokens(
                amount,
                0,
                path,
                address(this),
                // solhint-disable-next-line not-rely-on-time
                address(0)
            )
        returns (uint256[] memory) {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("EEIA: deposit fail");
        }
    }

    /**
     * @notice Exchange tokens using Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * "to" token address, "to" token amount, and amount type (must be absolute).
     * @param data Uniswap exchange path ending with tokens[0] (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be changed to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "EEIA: should be 1 tokenAmount");
        require(tokenAmounts[0].amountType == AmountType.Absolute, "EEIA: bad type");

        address[] memory path = abi.decode(data, (address[]));
        address token = tokenAmounts[0].token;
        require(token == path[path.length - 1], "EEIA: bad path[path.length - 1]");
        uint256 amount = tokenAmounts[0].amount;

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = token;

        ERC20(path[0]).safeApprove(ROUTER, ERC20(path[0]).balanceOf(address(this)), "EEIA[2]");

        try
            IEmiRouter(ROUTER).swapTokensForExactTokens(
                amount,
                type(uint256).max,
                path,
                address(this),
                // solhint-disable-next-line not-rely-on-time
                address(0)
            )
        returns (uint256[] memory) {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("EEIA: withdraw fail");
        }

        ERC20(path[0]).safeApprove(ROUTER, 0, "EEIA[3]");
    }
}
