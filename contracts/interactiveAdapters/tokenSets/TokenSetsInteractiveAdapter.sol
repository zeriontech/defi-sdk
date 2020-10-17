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
import { RebalancingSetToken } from "../../interfaces/RebalancingSetToken.sol";
import { SetToken } from "../../interfaces/SetToken.sol";

/**
 * @dev RebalancingSetIssuanceModule contract interface.
 * Only the functions required for TokenSetsInteractiveAdapter contract are added.
 * The RebalancingSetIssuanceModule contract is available here
 * github.com/SetProtocol/set-protocol-contracts/blob/master/contracts/core/modules/RebalancingSetIssuanceModule.sol.
 */
interface RebalancingSetIssuanceModule {
    function issueRebalancingSet(
        address,
        uint256,
        bool
    ) external;

    function redeemRebalancingSet(
        address,
        uint256,
        bool
    ) external;
}

/**
 * @title Interactive adapter for TokenSets.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenSetsInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant TRANSFER_PROXY = 0x882d80D3a191859d64477eb78Cca46599307ec1C;
    address internal constant ISSUANCE_MODULE = 0xDA6786379FF88729264d31d472FA917f5E561443;

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
        address set = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = set;

        uint256 amount = getSetAmountAndApprove(set, tokenAmounts);

        try
            RebalancingSetIssuanceModule(ISSUANCE_MODULE).issueRebalancingSet(set, amount, false)
         {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("TSIA: issue fail");
        }

        uint256 length = tokenAmounts.length;
        for (uint256 i = 0; i < length; i++) {
            ERC20(tokenAmounts[i].token).safeApprove(TRANSFER_PROXY, 0, "TSIA[2]");
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
        require(tokenAmounts.length == 1, "TSIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);
        RebalancingSetIssuanceModule issuanceModule = RebalancingSetIssuanceModule(
            ISSUANCE_MODULE
        );
        RebalancingSetToken rebalancingSetToken = RebalancingSetToken(token);
        address setToken = rebalancingSetToken.currentSet();
        tokensToBeWithdrawn = SetToken(setToken).getComponents();
        // solhint-disable-next-line no-empty-blocks
        try issuanceModule.redeemRebalancingSet(token, amount, false)  {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("TSIA: redeem fail");
        }
    }

    function getSetAmountAndApprove(address set, TokenAmount[] calldata tokenAmounts)
        internal
        returns (uint256 amount)
    {
        uint256 length = tokenAmounts.length;
        uint256[] memory absoluteAmounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            absoluteAmounts[i] = getAbsoluteAmountDeposit(tokenAmounts[i]);
            ERC20(tokenAmounts[i].token).safeApprove(
                TRANSFER_PROXY,
                absoluteAmounts[i],
                "TSIA![1]"
            );
        }

        RebalancingSetToken rebalancingSetToken = RebalancingSetToken(set);
        uint256 rUnit = rebalancingSetToken.getUnits()[0];
        uint256 rNaturalUnit = rebalancingSetToken.naturalUnit();

        address baseSetToken = rebalancingSetToken.currentSet();
        uint256[] memory bUnits = SetToken(baseSetToken).getUnits();
        uint256 bNaturalUnit = SetToken(baseSetToken).naturalUnit();
        address[] memory components = SetToken(baseSetToken).getComponents();
        require(components.length == length, "TSIA: bad tokens");

        amount = type(uint256).max;

        uint256 received;
        address token;
        for (uint256 i = 0; i < length; i++) {
            token = tokenAmounts[i].token;

            for (uint256 j = 0; j < length; j++) {
                if (token == components[j]) {
                    received = mul(
                        mul(absoluteAmounts[i], bNaturalUnit) / bUnits[j] / rUnit,
                        rNaturalUnit
                    );
                    if (received < amount) {
                        amount = received;
                    }
                }
            }
        }
    }
}
