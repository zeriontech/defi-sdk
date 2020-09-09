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

pragma solidity 0.7.1;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { CurveExchangeAdapter } from "../../adapters/curve/CurveExchangeAdapter.sol";
import { CurveInteractiveAdapter } from "./CurveInteractiveAdapter.sol";
import { Stableswap } from "../../interfaces/Stableswap.sol";


/**
 * @title Interactive adapter for Curve protocol (exchange).
 * @dev Implementation of CurveInteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveExchangeInteractiveAdapter is CurveInteractiveAdapter, CurveExchangeAdapter {
    using SafeERC20 for ERC20;

    uint256 internal constant POOLS_NUMBER = 8;

    address internal constant C_SWAP = 0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56;
    address internal constant T_SWAP = 0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C;
    address internal constant Y_SWAP = 0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51;
    address internal constant B_SWAP = 0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27;
    address internal constant S_SWAP = 0xA5407eAE9Ba41422680e2e00537571bcC53efBfD;
    address internal constant P_SWAP = 0x06364f10B501e868329afBc005b3492902d6C763;
    address internal constant RENBTC_SWAP = 0x93054188d876f558f4a66B2EF1d97d16eDf0895B;
    address internal constant SBTC_SWAP = 0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714;

    uint256 internal constant C_MASK = 1;
    uint256 internal constant T_MASK = 2;
    uint256 internal constant Y_MASK = 4;
    uint256 internal constant B_MASK = 8;
    uint256 internal constant S_MASK = 16;
    uint256 internal constant P_MASK = 32;
    uint256 internal constant RENBTC_MASK = 64;
    uint256 internal constant SBTC_MASK = 128;
    uint256 internal constant INIT_MASK = 255;

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
        uint256 poolsMask = INIT_MASK;

        if (toToken == DAI || fromToken == DAI) {
            poolsMask &= INIT_MASK - RENBTC_MASK - SBTC_MASK;
        }

        if (toToken == USDC || fromToken == USDC) {
            poolsMask &= INIT_MASK - RENBTC_MASK - SBTC_MASK;
        }

        if (toToken == USDT || fromToken == USDT) {
            poolsMask &= INIT_MASK - C_MASK - RENBTC_MASK - SBTC_MASK;
        }

        if (toToken == TUSD || fromToken == TUSD) {
            poolsMask &= Y_MASK;
        }

        if (toToken == BUSD || fromToken == BUSD) {
            poolsMask &= B_MASK;
        }

        if (toToken == SUSD || fromToken == SUSD) {
            poolsMask &= S_MASK;
        }

        if (toToken == PAX || fromToken == PAX) {
            poolsMask &= P_MASK;
        }

        if (toToken == RENBTC || fromToken == RENBTC) {
            poolsMask &= RENBTC_MASK + SBTC_MASK;
        }

        if (toToken == WBTC || fromToken == WBTC) {
            poolsMask &= RENBTC_MASK + SBTC_MASK;
        }

        if (toToken == SBTC || fromToken == SBTC) {
            poolsMask &= SBTC_MASK;
        }

        require(poolsMask != 0, "CEIA: tokens");

        return [
            poolsMask & C_MASK == 0 ? address(0) : C_SWAP,
            poolsMask & T_MASK == 0 ? address(0) : T_SWAP,
            poolsMask & Y_MASK == 0 ? address(0) : Y_SWAP,
            poolsMask & B_MASK == 0 ? address(0) : B_SWAP,
            poolsMask & S_MASK == 0 ? address(0) : S_SWAP,
            poolsMask & P_MASK == 0 ? address(0) : P_SWAP,
            poolsMask & RENBTC_MASK == 0 ? address(0) : RENBTC_SWAP,
            poolsMask & SBTC_MASK == 0 ? address(0) : SBTC_SWAP
        ];
    }
}
