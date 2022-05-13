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
import { TokenAmount } from "../../shared/Structs.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { StableMaster } from "../../interfaces/StableMaster.sol";
import { StakeDaoAngleVault } from "../../interfaces/StakeDaoAngleVault.sol";

/**
 * @title Interactive adapter for Angle Stable Master.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract StakeDaoAngleVaultInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the StableMaster of Angle.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying token address, underlying token amount to be deposited, and amount type.
     * @param data ABI-encoded additional parameters:
     *     - liquidityGauge - address of the Stakedao LiquidityGauge which will be tokens that represents stake
     *     - angleVault - StakeDao's related Angle Vault address
     * @return tokensToBeWithdrawn Array with ane element - staking token address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "SAVIA: should be 1 tokenAmount[1]");

        (address liquidityGauge, address angleVault) = abi.decode(data, (address, address));

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = liquidityGauge;

        ERC20(token).safeApprove(angleVault, amount, "SAVIA");
        try StakeDaoAngleVault(angleVault).deposit(address(this), amount, false) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("SAVIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the StableMaster.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * lp token address address, lp token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with one element - underlying token.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "SAVIA: should be 1 tokenAmount[2]");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = StakeDaoAngleVault(token).token();

        // solhint-disable-next-line no-empty-blocks
        try StakeDaoAngleVault(token).withdraw(amount) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("SAVIA: deposit fail");
        }
    }
}
