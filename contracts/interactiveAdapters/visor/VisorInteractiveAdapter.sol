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

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { IHypervisor } from "../../interfaces/IHypervisor.sol";

/**
 * @title Interactive adapter for Hypervisor protocol (fungible lp tokens on Uniswap v3).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author ztony.eth <tony.zhou.vue@gmail.com>
 */
contract VisorInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Hypervisor position (on Uniswap V3 pair).
     * @param tokenAmounts Array with two element - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - pair - pair address.
     * @return tokensToBeWithdrawn Array with one element - Hypervisor-token (pair) address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 2, "HVIA: should be 2 tokenAmounts");

        address pair = abi.decode(data, (address));
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pair;

        uint256 amount0Max = getAbsoluteAmountDeposit(tokenAmounts[0]);
        uint256 amount1Max = getAbsoluteAmountDeposit(tokenAmounts[1]);

        ERC20(tokenAmounts[0].token).safeApprove(pair, amount0Max, "HVIA[1]");
        ERC20(tokenAmounts[1].token).safeApprove(pair, amount1Max, "HVIA[2]");

        // solhint-disable-next-line no-empty-blocks
        try IHypervisor(pair).deposit(amount0Max, amount1Max, address(this)) returns (
            uint256
        ) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("HVIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * Hypervisor token address, Hypervisor token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with ONE OR TWO elements - underlying tokens (that are non-zero).
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "HVIA: should be 1 tokenAmount");

        address pair = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        // solhint-disable-next-line no-empty-blocks
        try IHypervisor(pair).withdraw(amount, address(this), address(this)) returns (
            uint256 amount0,
            uint256 amount1
        ) {
            require(amount0 > 0 || amount1 > 0, "HVIA: received 0 tokens on burn");
            if (amount0 > 0 && amount1 > 0) {
                tokensToBeWithdrawn = new address[](2);
                tokensToBeWithdrawn[0] = IHypervisor(pair).token0();
                tokensToBeWithdrawn[1] = IHypervisor(pair).token1();
            } else if (amount1 == 0) {
                tokensToBeWithdrawn = new address[](1);
                tokensToBeWithdrawn[0] = IHypervisor(pair).token0();
            } else {
                tokensToBeWithdrawn = new address[](1);
                tokensToBeWithdrawn[0] = IHypervisor(pair).token1();
            }
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("HVIA: withdraw fail");
        }
    }
}
