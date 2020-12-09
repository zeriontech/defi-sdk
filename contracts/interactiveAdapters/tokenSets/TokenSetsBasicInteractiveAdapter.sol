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
import { BasicIssuanceModule } from "../../interfaces/BasicIssuanceModule.sol";
import { SetTokenV2 } from "../../interfaces/SetTokenV2.sol";

/**
 * @title Interactive adapter for TokenSets (v2).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenSetsBasicInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant ISSUANCE_MODULE = 0xd8EF3cACe8b4907117a45B0b125c68560532F94D;

    /**
     * @notice Deposits tokens to the TokenSet.
     * @param tokenAmounts Array with TokenAmount structs with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - set - rebalancing set (v2) address.
     * @return tokensToBeWithdrawn Array with one element - rebalancing set address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        address setToken = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = setToken;

        uint256 length = tokenAmounts.length;
        uint256[] memory absoluteAmounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            absoluteAmounts[i] = getAbsoluteAmountDeposit(tokenAmounts[i]);
        }

        approveTokens(tokenAmounts, absoluteAmounts);

        uint256 setAmount = getSetAmount(setToken, tokenAmounts, absoluteAmounts);

        try
            BasicIssuanceModule(ISSUANCE_MODULE).issue(setToken, setAmount, address(this))
        {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("TSBIA: issue fail");
        }
    }

    /**
     * @notice Withdraws tokens from the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * rebalancing set (v2) address, rebalancing set amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with set token components.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "TSBIA: should be 1 tokenAmount");

        address setToken = tokenAmounts[0].token;
        uint256 setAmount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = SetTokenV2(setToken).getComponents();

        try
            BasicIssuanceModule(ISSUANCE_MODULE).redeem(setToken, setAmount, address(this))
        {} catch Error(
            // solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("TSBIA: redeem fail");
        }
    }

    function approveTokens(TokenAmount[] calldata tokenAmounts, uint256[] memory absoluteAmounts)
        internal
    {
        uint256 length = tokenAmounts.length;

        for (uint256 i = 0; i < length; i++) {
            ERC20(tokenAmounts[i].token).safeApproveMax(
                ISSUANCE_MODULE,
                absoluteAmounts[i],
                "TSBIA"
            );
        }
    }

    function getSetAmount(
        address setToken,
        TokenAmount[] calldata tokenAmounts,
        uint256[] memory absoluteAmounts
    ) internal view returns (uint256) {
        uint256 length = tokenAmounts.length;
        uint256 setAmount = type(uint256).max;
        uint256 tempAmount;

        for (uint256 i = 0; i < length; i++) {
            tempAmount =
                (mul_(absoluteAmounts[i] - 1, 1e18) + 1) /
                uint256(SetTokenV2(setToken).getDefaultPositionRealUnit(tokenAmounts[i].token));
            if (tempAmount < setAmount) {
                setAmount = tempAmount;
            }
        }

        return setAmount;
    }
}
