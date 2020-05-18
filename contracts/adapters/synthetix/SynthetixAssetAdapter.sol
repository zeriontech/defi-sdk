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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev CurveRewards contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The CurveRewards contract is available here
 * github.com/Synthetixio/Unipool/blob/master/contracts/CurveRewards.sol.
 */
interface CurveRewards {
    function earned(address) external view returns (uint256);
}


/**
 * @dev iETHRewards contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The iETHRewards contract is available here
 * github.com/Synthetixio/Unipool/blob/master/contracts/iETHRewards.sol.
 */
// solhint-disable-next-line contract-name-camelcase
interface iETHRewards {
    function earned(address) external view returns (uint256);
}


/**
 * @dev Unipool contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The Unipool contract is available here
 * github.com/Synthetixio/Unipool/blob/master/contracts/Unipool.sol.
 */
interface Unipool {
    function earned(address) external view returns (uint256);
}


/**
 * @dev Proxy contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The Proxy contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @dev Synthetix contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The Synthetix contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Synthetix.sol.
 */
interface Synthetix {
    function collateral(address) external view returns (uint256);
}


/**
 * @title Asset adapter for Synthetix protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract SynthetixAssetAdapter is ProtocolAdapter("Asset") {

    address internal constant SNX = 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F;
    address internal constant SUSD_POOL_TOKEN = 0xC25a3A3b969415c80451098fa907EC722572917F;
    address internal constant IETH = 0xA9859874e1743A32409f75bB11549892138BBA1E;
    address internal constant UNISWAP_SETH = 0xe9Cf7887b93150D4F2Da7dFc6D502B216438F244;
    address internal constant LP_REWARD_CURVE = 0xDCB6A51eA3CA5d3Fd898Fd6564757c7aAeC3ca92;
    address internal constant LP_REWARD_IETH = 0xC746bc860781DC90BBFCD381d6A058Dc16357F8d;
    address internal constant LP_REWARD_UNISWAP = 0x48D7f315feDcaD332F68aafa017c7C158BC54760;

    /**
     * @return Amount of SNX locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(
        address token,
        address account
    )
        public
        view
        override
        returns (uint256, bytes32)
    {
        if (token == SNX) {
            uint256 balance = Synthetix(Proxy(SNX).target()).collateral(account);
            balance += CurveRewards(LP_REWARD_CURVE).earned(account);
            balance += iETHRewards(LP_REWARD_IETH).earned(account);
            balance += Unipool(LP_REWARD_UNISWAP).earned(account);
            return (balance, "ERC20");
        } else if (token == SUSD_POOL_TOKEN) {
            return (ERC20(LP_REWARD_CURVE).balanceOf(account), "Curve Pool Token");
        } else if (token == IETH) {
            return (ERC20(LP_REWARD_IETH).balanceOf(account), "ERC20");
        } else if (token == UNISWAP_SETH) {
            return (ERC20(LP_REWARD_UNISWAP).balanceOf(account), "Uniswap V1 Pool Token");
        } else {
            return (0, "");
        }
    }
}
