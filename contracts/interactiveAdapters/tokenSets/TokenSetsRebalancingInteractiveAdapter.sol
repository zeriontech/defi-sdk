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
import { RebalancingSetIssuanceModule } from "../../interfaces/RebalancingSetIssuanceModule.sol";
import { RebalancingSetToken } from "../../interfaces/RebalancingSetToken.sol";
import { SetToken } from "../../interfaces/SetToken.sol";

/**
 * @title Interactive adapter for TokenSets.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenSetsRebalancingInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant TRANSFER_PROXY = 0x882d80D3a191859d64477eb78Cca46599307ec1C;
    address internal constant ISSUANCE_MODULE = 0xcEDA8318522D348f1d1aca48B24629b8FbF09020;

    /**
     * @notice Deposits tokens to the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - set - rebalancing set address.
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

        uint256 amount = getSetAmountAndApprove(setToken, tokenAmounts);

        try
            RebalancingSetIssuanceModule(ISSUANCE_MODULE).issueRebalancingSet(
                setToken,
                amount,
                true
            )
        {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("TSRIA: issue fail");
        }
    }

    /**
     * @notice Withdraws tokens from the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * rebalancing set address, rebalancing set amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with set token components.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "TSRIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);
        address setToken = RebalancingSetToken(token).currentSet();
        amount = amount - (amount % RebalancingSetToken(token).naturalUnit());

        tokensToBeWithdrawn = SetToken(setToken).getComponents();

        try
            RebalancingSetIssuanceModule(ISSUANCE_MODULE).redeemRebalancingSet(token, amount, true)
        {} catch Error(
            // solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("TSRIA: redeem fail");
        }
    }

    function getSetAmountAndApprove(address setToken, TokenAmount[] calldata tokenAmounts)
        internal
        returns (uint256)
    {
        uint256 length = tokenAmounts.length;
        uint256 amount;
        uint256[] memory absoluteAmounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            amount = getAbsoluteAmountDeposit(tokenAmounts[i]);
            absoluteAmounts[i] = amount;

            ERC20(tokenAmounts[i].token).safeApproveMax(TRANSFER_PROXY, amount, "TSRIA");
        }

        RebalancingSetToken rebalancingSetToken = RebalancingSetToken(setToken);
        uint256 rebalancingUnit = rebalancingSetToken.getUnits()[0];
        uint256 rebalancingNaturalUnit = rebalancingSetToken.naturalUnit();

        address baseSetToken = rebalancingSetToken.currentSet();
        uint256[] memory baseUnits = SetToken(baseSetToken).getUnits();
        uint256 baseNaturalUnit = SetToken(baseSetToken).naturalUnit();

        uint256 setAmount = type(uint256).max;

        uint256 tempAmount;
        for (uint256 i = 0; i < length; i++) {
            tempAmount = mul_(
                mul_(absoluteAmounts[i] / baseUnits[i] - 1, baseNaturalUnit) / rebalancingUnit,
                rebalancingNaturalUnit
            );
            if (tempAmount < setAmount) {
                setAmount = tempAmount;
            }
        }

        return setAmount;
    }
}
