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
import { UniswapV2Pair } from "../../interfaces/UniswapV2Pair.sol";

/**
 * @title Interactive adapter for Uniswap V2 protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract UniswapV2AssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Uniswap pool (pair).
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameter:
     *     - pair - pair address.
     * @return tokensToBeWithdrawn Array with one element - UNI-token (pair) address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 2, "ULIA: should be 2 tokenAmounts");

        address pair = abi.decode(data, (address));
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pair;

        uint256 amount0 = getAbsoluteAmountDeposit(tokenAmounts[0]);
        uint256 amount1 = getAbsoluteAmountDeposit(tokenAmounts[1]);

        (uint256 reserve0, uint256 reserve1) = UniswapV2Pair(pair).getReserves();

        uint256 amount1Optimal = (amount0 * reserve1) / reserve0;
        if (amount1Optimal < amount1) {
            amount1 = amount1Optimal;
        } else if (amount1Optimal > amount1) {
            amount0 = (amount1 * reserve0) / reserve1;
        }

        ERC20(tokenAmounts[0].token).safeTransfer(pair, amount0, "ULIA[1]");
        ERC20(tokenAmounts[1].token).safeTransfer(pair, amount1, "ULIA[2]");

        // solhint-disable-next-line no-empty-blocks
        try UniswapV2Pair(pair).mint(address(this)) returns (uint256) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("ULIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * UNI token address, UNI token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with two elements - underlying tokens.
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
        tokensToBeWithdrawn[0] = UniswapV2Pair(token).token0();
        tokensToBeWithdrawn[1] = UniswapV2Pair(token).token1();

        ERC20(token).safeTransfer(token, amount, "ULIA[3]");

        // solhint-disable-next-line no-empty-blocks
        try UniswapV2Pair(token).burn(address(this)) returns (uint256, uint256) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("ULIA: withdraw fail");
        }
    }
}
