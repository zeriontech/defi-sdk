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
import { StakeDaoLiquidityGauge } from "../../interfaces/StakeDaoLiquidityGauge.sol";

/**
 * @title Interactive adapter for Stakedao Angle Strategy Vault.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract StakeDaoAngleVaultInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Stakedao's Angle strategy Vault
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying token address, underlying token amount to be deposited, and amount type.
     * @param data ABI-encoded additional parameters:
     *     - liquidityGauge - address of the Stakedao liquidity gauge,
     * which will be tokens that represent stake
     * @return tokensToBeWithdrawn Array with ane element - staking token address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "SDAVIA: should be 1 tokenAmount[1]");

        (address liquidityGauge) = abi.decode(data, (address));

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = liquidityGauge;

        address angleVault = StakeDaoLiquidityGauge(liquidityGauge).vault();
        ERC20(token).safeApproveMax(angleVault, amount, "SDAVIA");
        try StakeDaoAngleVault(angleVault).deposit(address(this), amount, false) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("SDAVIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Stakedao's Angle strategy vault.
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
        require(tokenAmounts.length == 1, "SDAVIA: should be 1 tokenAmount[2]");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = StakeDaoLiquidityGauge(token).staking_token();

        address angleVault = StakeDaoLiquidityGauge(token).vault();
        // solhint-disable-next-line no-empty-blocks
        try StakeDaoAngleVault(angleVault).withdraw(amount) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("SDAVIA: withdraw fail");
        }
    }
}
