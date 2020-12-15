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
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { ATokenV2 } from "../../interfaces/ATokenV2.sol";
import { LendingPoolAddressesProvider } from "../../interfaces/LendingPoolAddressesProvider.sol";
import { LendingPoolV2 } from "../../interfaces/LendingPoolV2.sol";

/**
 * @title Interactive adapter for Aave protocol (V2).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AaveV2AssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant PROVIDER = 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5;
    uint16 internal constant ZERION_REFERRAL_CODE = 153;

    /**
     * @notice Deposits tokens to the Aave protocol (V2).
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying token address, underlying token amount to be deposited, and amount type.
     * @return tokensToBeWithdrawn Array with ane element - aToken.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "AAIAv2: should be 1 tokenAmount[1]");

        address pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();
        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = LendingPoolV2(pool).getReserveData(token).aTokenAddress;

        ERC20(token).safeApproveMax(pool, amount, "AAIAv2");

        try
            LendingPoolV2(pool).deposit(token, amount, address(this), ZERION_REFERRAL_CODE)
        {} catch Error(
            // solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("AAIAv2: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Aave protocol (V2).
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * aToken address, aToken amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with one element - underlying token.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "AAIAv2: should be 1 tokenAmount[2]");

        address pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();

        address underlyingToken = ATokenV2(tokenAmounts[0].token).UNDERLYING_ASSET_ADDRESS();
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = underlyingToken;

        // solhint-disable-next-line no-empty-blocks
        try LendingPoolV2(pool).withdraw(underlyingToken, amount, address(this)) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("AAIAv2: withdraw fail");
        }
    }
}
