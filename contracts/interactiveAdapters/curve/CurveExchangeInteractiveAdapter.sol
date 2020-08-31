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

pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { CurveExchangeAdapter } from "../../adapters/curve/CurveExchangeAdapter.sol";
import { CurveInteractiveAdapter } from "./CurveInteractiveAdapter.sol";


/**
 * @dev Stableswap contract interface.
 * Only the functions required for CurveExchangeInteractiveAdapter contract are added.
 * The Stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
/* solhint-disable func-name-mixedcase */
interface Stableswap {
    function exchange_underlying(int128, int128, uint256, uint256) external;
    function get_dy_underlying(int128, int128, uint256) external view returns (uint256);
}
/* solhint-enable func-name-mixedcase */


/**
 * @title Interactive adapter for Curve protocol (exchange).
 * @dev Implementation of CurveInteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveExchangeInteractiveAdapter is CurveInteractiveAdapter, CurveExchangeAdapter {
    using SafeERC20 for ERC20;

    uint256 internal constant POOLS_NUMBER = 7;

    /**
     * @notice Exchanges tokens using pool with the best rate.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * "from" token address, "from" token amount to be deposited, and amount type.
     * @param data Token address to be exchanged to (ABI-encoded).
     * @return tokensToBeWithdrawn Array with one element - token address to be exchanged to.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        TokenAmount[] memory tokenAmounts,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "CEIA: should be 1 tokens");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);
        address toToken = abi.decode(data, (address));
        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toToken;

        address[POOLS_NUMBER] memory pools = getCurvePools(token, toToken);
        int128 i = getTokenIndex(token);
        int128 j = getTokenIndex(toToken);

        uint256 rate = 0;
        uint256 index;
        for (uint256 k = 0; k < POOLS_NUMBER; k++) {
            if (pools[k] != address(0)) {
                try Stableswap(pools[k]).get_dy_underlying(i, j, amount) returns (uint256 result) {
                    if (result > rate) {
                        rate = result;
                        index = k;
                    }
                } catch Error(string memory reason) {
                    revert(reason);
                } catch {
                    revert("CEIA: get rate fail[1]");
                }
            }
        }

        ERC20(token).safeApprove(pools[index], amount, "CEIA");
        // solhint-disable-next-line no-empty-blocks
        try Stableswap(pools[index]).exchange_underlying(i, j, amount, 0) {
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("CEIA: deposit fail");
        }
    }

    /**
     * @notice Withdraw functionality is not supported.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        TokenAmount[] memory,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory)
    {
        revert("CEIA: no withdraw");
    }

    function getCurvePools(
        address toToken,
        address fromToken
    )
        internal
        pure
        returns (address[POOLS_NUMBER] memory)
    {
        uint256 poolsMask = 127;

        if (toToken == DAI || fromToken == DAI) {
            poolsMask &= 63; // everything except renBTC Pool
        }
        if (toToken == USDC || fromToken == USDC) {
            poolsMask &= 63; // everything except renBTC Pool
        }
        if (toToken == USDT || fromToken == USDT) {
            poolsMask &= 62; // everything except Compound Pool and renBTC Pool
        }
        if (toToken == TUSD || fromToken == TUSD) {
            poolsMask &= 4; // Y Pool only
        }
        if (toToken == BUSD || fromToken == BUSD) {
            poolsMask &= 8; // bUSD Pool onlly
        }
        if (toToken == SUSD || fromToken == SUSD) {
            poolsMask &= 16; // sUSD Pool only
        }
        if (toToken == PAX || fromToken == PAX) {
            poolsMask &= 32; // PAX Pool only
        }
        if (toToken == RENBTC || fromToken == RENBTC) {
            poolsMask &= 64; // renBTC Pool only
        }
        if (toToken == WBTC || fromToken == WBTC) {
            poolsMask &= 64; // renBTC Pool only
        }

        require(poolsMask != 0, "CEIA: bad pools");

        return [
            poolsMask & 1 == 0 ? address(0) : C_SWAP,
            poolsMask & 2 == 0 ? address(0) : T_SWAP,
            poolsMask & 4 == 0 ? address(0) : Y_SWAP,
            poolsMask & 8 == 0 ? address(0) : B_SWAP,
            poolsMask & 16 == 0 ? address(0) : S_SWAP,
            poolsMask & 32 == 0 ? address(0) : P_SWAP,
            poolsMask & 64 == 0 ? address(0) : REN_SWAP
        ];
    }
}
