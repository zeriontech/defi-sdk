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
import { MixinExchangeCore } from "../../interfaces/MixinExchangeCore.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";

/**
 * @title Interactive adapter for 0x Orders (v2).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ZeroExOrdersV2InteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant ZERO_EX_EXCHANGE = 0x080bf510FCbF18b91105470639e9561022937712;
    address internal constant ZERO_EX_ERC_20_PROXY = 0x95E6F48254609A6ee006F7D493c8e5fB97094ceF;

    /**
     * @notice Exchanges tokens using ZeroEx contract.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     *     "sell" token address, "sell" token amount to be deposited, and amount type.
     * @param data Bytes array with ABI-encoded Order and signature.
     * @return tokensToBeWithdrawn Array with one element -  "buy" token address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "ZEOV2IA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        (
            MixinExchangeCore.Order memory order,
            uint256 takerAssetFillAmount,
            bytes memory signature
        ) = abi.decode(data, (MixinExchangeCore.Order, uint256, bytes));

        ERC20(token).safeApproveMax(ZERO_EX_ERC_20_PROXY, amount, "ZEOV2IA");

        tokensToBeWithdrawn = new address[](1);
        // Shift by 516 = 32 * 16 + 4 to get return token address from data
        tokensToBeWithdrawn[0] = abi.decode(data[516:], (address));

        try
            MixinExchangeCore(ZERO_EX_EXCHANGE).fillOrder(order, takerAssetFillAmount, signature)
        returns (MixinExchangeCore.FillResults memory) {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("ZEOV2IA: deposit fail");
        }
    }

    /**
     * @notice Withdraw functionality is not integrated yet.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata, bytes calldata)
        external
        payable
        override
        returns (address[] memory)
    {
        revert("ZEOV2IA: no withdraw");
    }
}
