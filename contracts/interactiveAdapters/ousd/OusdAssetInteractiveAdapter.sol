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
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { OusdVault } from "../../interfaces/OusdVault.sol";
import { OusdToken } from "../../interfaces/OusdToken.sol";

/**
 * @title Interactive adapter for OUSD token.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Domen Grabec <domen@originprotocol.com>
 */
contract OusdAssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant OUSD = 0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86;

    /**
     * @notice Deposits tokens to the OUSD token.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * token address, token amount to be deposited, and amount type.
     * @return tokensToBeWithdrawn Array with one element - OUSD address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "OAIA: should be 1 tokenAmount[1]");
        address vaultAddress = OusdToken(OUSD).vaultAddress();

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = OUSD;

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);
        ERC20(token).safeApproveMax(vaultAddress, amount, "OAIA");

        // solhint-disable-next-line no-empty-blocks
        try OusdVault(vaultAddress).mint(token, amount, 0) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("OAIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the OUSD token.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * OUSD token address, OUSD token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with three elements - OUSD components.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "OAIA: should be 1 tokenAmount[2]");
        require(tokenAmounts[0].token == OUSD, "OAIA: should be OUSD");

        address vaultAddress = OusdToken(OUSD).vaultAddress();

        tokensToBeWithdrawn = OusdVault(vaultAddress).getAllAssets();

        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);
        // solhint-disable-next-line no-empty-blocks
        try OusdVault(vaultAddress).redeem(amount, 0) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("OAIA: withdraw fail");
        }
    }
}
