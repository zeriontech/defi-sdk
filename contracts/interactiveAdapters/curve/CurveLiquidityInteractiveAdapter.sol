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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType, ActionType } from "../../Structs.sol";
import { CurveLiquidityAdapter } from "../../adapters/curve/CurveLiquidityAdapter.sol";
import { CurveInteractiveAdapter } from "./CurveInteractiveAdapter.sol";


/**
 * @dev Stableswap contract interface.
 * Only the functions required for CurveLiquidityInteractiveAdapter contract are added.
 * The Stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
/* solhint-disable func-name-mixedcase */
interface Stableswap {
    function underlying_coins(int128) external view returns (address);
}
/* solhint-enable func-name-mixedcase */


/**
 * @dev Deposit contract interface.
 * Only the functions required for CurveLiquidityInteractiveAdapter contract are added.
 * The Deposit contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/deposit.vy.
 */
/* solhint-disable func-name-mixedcase */
interface Deposit {
    function add_liquidity(uint256[2] calldata, uint256) external;
    function add_liquidity(uint256[3] calldata, uint256) external;
    function add_liquidity(uint256[4] calldata, uint256) external;
    function remove_liquidity_one_coin(uint256, int128, uint256, bool) external;
}
/* solhint-enable func-name-mixedcase */


/**
 * @title Interactive adapter for Curve protocol (liquidity).
 * @dev Implementation of CurveInteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveLiquidityInteractiveAdapter is CurveInteractiveAdapter, CurveLiquidityAdapter {

    using SafeERC20 for ERC20;

    /**
     * @notice Deposits tokens to the Curve pool (pair).
     * @param tokens Array with one element - token address to be deposited.
     * @param amounts Array with one element - token amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @param data ABI-encoded additional parameters:
     *     - crvToken - curve token address.
     * @return tokensToBeWithdrawn Array with tokens sent back.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "CLIA: should be 1 tokens!");
        require(tokens.length == amounts.length, "CLIA: inconsistent arrays!");

        address crvToken = abi.decode(data, (address));
        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = crvToken;

        address callee = crvToken == S_CRV ? getSwap(crvToken) : getDeposit(crvToken);
        uint256 totalCoins = getTotalCoins(crvToken);

        uint256 tokenIndex = uint256(getTokenIndex(tokens[0]));

        uint256[] memory inputAmounts = new uint256[](totalCoins);

        for (uint256 i = 0; i < totalCoins; i++) {
            inputAmounts[i] = i == tokenIndex ? amount : 0;
        }

        ERC20(tokens[0]).safeApprove(
            callee,
            amount,
            "CLIA![1]"
        );

        if (totalCoins == 2) {
            try Deposit(callee).add_liquidity(
                [inputAmounts[0], inputAmounts[1]],
                0
            ) { // solhint-disable-line no-empty-blocks
            } catch {
                revert("CLIA: deposit fail![1]");
            }
        } else if (totalCoins == 3) {
            try Deposit(callee).add_liquidity(
                [inputAmounts[0], inputAmounts[1], inputAmounts[2]],
                0
            ) { // solhint-disable-line no-empty-blocks
            } catch {
                revert("CLIA: deposit fail![2]");
            }
        } else if (totalCoins == 4) {
            try Deposit(callee).add_liquidity(
                [inputAmounts[0], inputAmounts[1], inputAmounts[2], inputAmounts[3]],
                0
            ) { // solhint-disable-line no-empty-blocks
            } catch {
                revert("CLIA: deposit fail![3]");
            }
        }
    }

    /**
     * @notice Withdraws tokens from the Curve pool.
     * @param tokens Array with one element - Curve token address.
     * @param amounts Array with one element - Curve token amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @param data ABI-encoded additional parameters:
     *     - toToken - return token address (one of those used in pool).
     * @return tokensToBeWithdrawn Array with on element - underlying tokens.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "CLIA: should be 1 token!");
        require(tokens.length == amounts.length, "CLIA: inconsistent arrays!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);
        address toToken = abi.decode(data, (address));
        int128 index = getTokenIndex(toToken);
        address callee = getDeposit(tokens[0]);
        require(
            Stableswap(getSwap(tokens[0])).underlying_coins(index) == toToken,
            "CLIA: bad toToken!"
        );

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toToken;

        ERC20(tokens[0]).safeApprove(
            callee,
            amount,
            "CLIA![2]"
        );

        try Deposit(callee).remove_liquidity_one_coin(
            amount,
            index,
            0,
            true
        ) { // solhint-disable-line no-empty-blocks
        } catch {
            revert("CLIA: withdraw fail!");
        }
    }
}
