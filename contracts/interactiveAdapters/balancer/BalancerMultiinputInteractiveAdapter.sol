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
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { BPool } from "../../interfaces/BPool.sol";

/**
 * @title Interactive adapter for Balancer (Multi-input).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BalancerMultiinputInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the TokenSet.
     * @param tokenAmounts Array with TokenAmount structs with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - pool - Balancer pool address.
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

        uint256 length = tokenAmounts.length;
        uint256[] memory absoluteAmounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            absoluteAmounts[i] = getAbsoluteAmountDeposit(tokenAmounts[i]);
        }

        approveTokens(pool, tokenAmounts, absoluteAmounts);

        uint256 poolAmount = getPoolAmount(pool, tokenAmounts, absoluteAmounts);

        //solhint-disable-next-line no-empty-blocks
        try BPool(pool).joinPool(poolAmount, absoluteAmounts) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("BMIA: issue fail");
        }
    }

    /**
     * @notice Withdraws tokens from the TokenSet.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * pool address, pool amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with pool token components.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "BMIA: should be 1 tokenAmount");

        address pool = tokenAmounts[0].token;
        uint256 poolAmount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = BPool(pool).getCurrentTokens();

        try
            BPool(pool).exitPool(poolAmount, new uint256[](tokensToBeWithdrawn.length))
        {} catch Error(
            // solhint-disable-previous-line no-empty-blocks
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("BMIA: redeem fail");
        }
    }

    function approveTokens(
        address pool,
        TokenAmount[] calldata tokenAmounts,
        uint256[] memory absoluteAmounts
    ) internal {
        uint256 length = tokenAmounts.length;

        for (uint256 i = 0; i < length; i++) {
            ERC20(tokenAmounts[i].token).safeApproveMax(pool, absoluteAmounts[i], "BMIA");
        }
    }

    function getPoolAmount(
        address pool,
        TokenAmount[] calldata tokenAmounts,
        uint256[] memory absoluteAmounts
    ) internal view returns (uint256) {
        uint256 length = tokenAmounts.length;
        uint256 poolAmount = type(uint256).max;
        uint256 tempAmount;

        for (uint256 i = 0; i < length; i++) {
            tempAmount = bmul(
                bdiv(absoluteAmounts[i] - 1, BPool(pool).getBalance(tokenAmounts[i].token)) - 1,
                ERC20(pool).totalSupply()
            );
            if (tempAmount < poolAmount) {
                poolAmount = tempAmount;
            }
        }

        return poolAmount;
    }

    /**
     * @dev This function is taken from BNum contract
     * BNum contract may be found here:
     * github.com/balancer-labs/balancer-core/blob/master/contracts/BNum.sol
     */
    function bmul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c0 = a * b;
        require(a == 0 || c0 / a == b, "BMIA: ERR_MUL_OVERFLOW");
        uint256 c1 = c0 + (1e18 / 2);
        require(c1 >= c0, "BMIA: ERR_MUL_OVERFLOW");
        uint256 c2 = c1 / 1e18;
        return c2;
    }

    /**
     * @dev This function is taken from BNum contract
     * BNum contract may be found here:
     * github.com/balancer-labs/balancer-core/blob/master/contracts/BNum.sol
     */
    function bdiv(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "BMIA: ERR_DIV_ZERO");
        uint256 c0 = a * 1e18;
        require(a == 0 || c0 / a == 1e18, "BMIA: ERR_DIV_INTERNAL"); // bmul overflow
        uint256 c1 = c0 + (b / 2);
        require(c1 >= c0, "BMIA: ERR_DIV_INTERNAL"); //  badd require
        uint256 c2 = c1 / b;
        return c2;
    }
}
