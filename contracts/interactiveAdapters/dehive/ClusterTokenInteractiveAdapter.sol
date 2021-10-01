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

import { TokenAmount } from "../../shared/Structs.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";

import { DeHiveProtocolAdapter } from "../../adapters/dehive/DeHiveProtocolAdapter.sol";

import { IExternalAdapter } from "../../interfaces/IExternalAdapter.sol";

/**
 * @title Interactive adapter for DeHive protocol.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */

contract ClusterTokenInteractiveAdapter is InteractiveAdapter, DeHiveProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant EXTERNAL_ADAPTER = address(0x0c1520153044bE0bd29D93E356c1BABfa4996c6A);
    /**
     * @notice Deposits tokens to the DeHive ClusterToken.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * ETH address, ETH amount to be deposited, and amount type.
     * @param data ABI-encoded additional parameters:
     *     - clusterToken - ClusterToken address.
     * @return tokensToBeWithdrawn Array with two elements - ETH and ClusterToken address.
     * @dev Implementation of InteractiveAdapter function.
     */

    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "DeHive: should be one token[1]");
        require(tokenAmounts[0].token == ETH, "DeHive: should be ETH[2]");

        address clusterToken = abi.decode(data, (address));
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = clusterToken;
        tokensToBeWithdrawn[1] = ETH;

        //require(false, "error 2");
        // solhint-disable-next-line no-empty-blocks
        try IExternalAdapter(EXTERNAL_ADAPTER).deposit{value: amount}(clusterToken) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("DeHive: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the DeHive protocol.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * ClusterToken address, ClusterToken amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with one element - ETH address.
     * @dev Implementation of InteractiveAdapter function.
     */

    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "DeHive: should be 1 tokenAmount[3]");

        address clusterToken = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = ETH;

        ERC20(clusterToken).safeApprove(EXTERNAL_ADAPTER, amount, "DeHive");
        // solhint-disable-next-line no-empty-blocks
        try IExternalAdapter(EXTERNAL_ADAPTER).withdraw(clusterToken, amount) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("DeHive: withdraw fail");
        }
    }
}