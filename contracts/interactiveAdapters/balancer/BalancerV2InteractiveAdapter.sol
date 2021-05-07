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
import { Vault } from "../../interfaces/Vault.sol";
import { BalancerBasePool } from "../../interfaces/BalancerBasePool.sol";

/**
 * @title Interactive adapter for Balancer V2.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BalancerV2InteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Balancer V2 pool.
     * @param tokenAmounts Array with TokenAmount structs with
     *     underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameter:
     *     - pool - Balancer V2 pool address.
     * @return tokensToBeWithdrawn Array with one element - pool address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        address pool = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = pool;

        uint256[] memory absoluteAmounts = getAbsoluteAmounts(tokenAmounts);
        address vault = BalancerBasePool(pool).getVault();
        approveTokens(vault, tokenAmounts, absoluteAmounts);

        try
            Vault(vault).joinPool(
                BalancerBasePool(pool).getPoolId(),
                address(this),
                address(this),
                Vault.JoinPoolRequest({
                    assets: getAssets(tokenAmounts),
                    maxAmountsIn: absoluteAmounts,
                    userData: abi.encode(1, absoluteAmounts),
                    fromInternalBalance: false
                })
            )
        {} catch Error(
            //solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("BV2MIA: join fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Balancer V2 pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     *     pool address, pool amount to be redeemed, and amount type.
     * @param data ABI-encoded additional parameter (optional):
     *     - index of token used for withdrawal.
     * @return tokensToBeWithdrawn Array with pool token components.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "BV2MIA: should be 1 tokenAmount");

        bytes32 poolId = BalancerBasePool(tokenAmounts[0].token).getPoolId();
        address vault = BalancerBasePool(tokenAmounts[0].token).getVault();

        (tokensToBeWithdrawn, , ) = Vault(vault).getPoolTokens(poolId);

        bytes memory userData =
            data.length == 0
                ? abi.encode(1, getAbsoluteAmountWithdraw(tokenAmounts[0]))
                : abi.encode(
                    0,
                    getAbsoluteAmountWithdraw(tokenAmounts[0]),
                    abi.decode(data, (uint8))
                );
        try
            Vault(vault).exitPool(
                poolId,
                address(this),
                payable(address(this)),
                Vault.ExitPoolRequest({
                    assets: tokensToBeWithdrawn,
                    minAmountsOut: new uint256[](tokensToBeWithdrawn.length),
                    userData: userData,
                    toInternalBalance: false
                })
            )
        {} catch Error(
            // solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("BV2MIA: exit fail");
        }
    }

    function approveTokens(
        address pool,
        TokenAmount[] calldata tokenAmounts,
        uint256[] memory absoluteAmounts
    ) internal {
        uint256 length = tokenAmounts.length;

        for (uint256 i = 0; i < length; i++) {
            ERC20(tokenAmounts[i].token).safeApproveMax(pool, absoluteAmounts[i], "BV2MIA");
        }
    }

    function getAbsoluteAmounts(TokenAmount[] calldata tokenAmounts)
        internal
        view
        returns (uint256[] memory absoluteAmounts)
    {
        uint256 length = tokenAmounts.length;
        absoluteAmounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            absoluteAmounts[i] = getAbsoluteAmountDeposit(tokenAmounts[i]);
        }

        return absoluteAmounts;
    }

    function getAssets(TokenAmount[] calldata tokenAmounts)
        internal
        pure
        returns (address[] memory assets)
    {
        uint256 length = tokenAmounts.length;
        assets = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            assets[i] = tokenAmounts[i].token;
        }

        return assets;
    }
}
