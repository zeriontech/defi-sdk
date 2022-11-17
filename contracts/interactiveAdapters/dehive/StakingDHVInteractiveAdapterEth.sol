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

import { StakingDHVAdapter } from "../../adapters/dehive/StakingDHVAdapter.sol";

import { IStakingPools } from "../../interfaces/IStakingPools.sol";

/**
 * @title Interactive adapter for DeHive protocol.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */

contract StakingDHVInteractiveAdapterEth is InteractiveAdapter, StakingDHVAdapter {
    using SafeERC20 for ERC20;

    address internal constant STAKING_DHV = address(0x04595f9010F79422a9b411ef963e4dd1F7107704);
    address internal constant DHV_TOKEN = address(0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A);
    /**
     * @notice Deposits tokens to the DeHive StakingDHV.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * DHV address, DHV amount to be deposited, and amount type.
     * @param data ABI-encoded additional parameters:
     *     - userAddress - Address of user address.
     * @return tokensToBeWithdrawn Empty array.
     * @dev Implementation of InteractiveAdapter function.
     */

    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "StakingDHV: should be one token[1]");
        require(tokenAmounts[0].token == DHV_TOKEN, "StakingDHV: should be DHV[2]");

        address userAddress = abi.decode(data, (address));
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);


        ERC20(tokenAmounts[0].token).safeApprove(STAKING_DHV, amount, "DHV");
        // solhint-disable-next-line no-empty-blocks
        try IStakingPools(STAKING_DHV).depositFor(0, amount, userAddress) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("StakingDHV: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the DeHive StakingDHV.
     * @param tokenAmounts Empty array.
     * @return tokensToBeWithdrawn Empty array.
     * @dev Implementation of InteractiveAdapter function.
     */

    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        revert("StakingDHV: Can't withdraw");
    }
}