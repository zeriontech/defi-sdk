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
import { CompoundRegistry } from "../../adapters/compound/CompoundRegistry.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { CToken } from "../../interfaces/CToken.sol";
import { CEther } from "../../interfaces/CEther.sol";

/**
 * @title Interactive adapter for Compound protocol.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract CompoundAssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant COMP = 0xc00e94Cb662C3520282E6f5717214004A7f26888;
    address internal constant REGISTRY = 0xAc41dB9741F869E432575952748e7064d299614D;

    /**
     * @notice Deposits tokens to the Compound protocol.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying token address, underlying token amount to be deposited, and amount type.
     * @return tokensToBeWithdrawn Array with two elements - cToken and COMP addresses.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "CAIA: should be 1 tokenAmount[1]");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = COMP;

        if (token == ETH) {
            tokensToBeWithdrawn[1] = CETH;

            CEther(CETH).mint{ value: amount }();
        } else {
            address cToken = CompoundRegistry(REGISTRY).getCToken(token);
            tokensToBeWithdrawn[1] = cToken;

            ERC20(token).safeApproveMax(cToken, amount, "CAIA");
            require(CToken(cToken).mint(amount) == 0, "CAIA: deposit failed");
        }
    }

    /**
     * @notice Withdraws tokens from the Compound protocol.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * cToken address, cToken amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with two elements - underlying token and COMP addresses.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "CAIA: should be 1 tokenAmount[2]");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = COMP;

        if (token == CETH) {
            tokensToBeWithdrawn[1] = ETH;
        } else {
            tokensToBeWithdrawn[1] = CToken(token).underlying();
        }

        require(CToken(token).redeem(amount) == 0, "CAIA: withdraw failed");
    }
}
