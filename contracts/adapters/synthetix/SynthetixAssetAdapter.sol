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

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev StakingRewards contract interface.
 * Only the functions required for SynthetixAssetAdapter contract are added.
 * The StakingRewards contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol.
 */
interface StakingRewards {
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
contract SynthetixAssetAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant SNX = 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F;
    address internal constant CURVE_SUSD = 0xC25a3A3b969415c80451098fa907EC722572917F;
    address internal constant CURVE_SBTC = 0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3;
    address internal constant IETH = 0xA9859874e1743A32409f75bB11549892138BBA1E;
    address internal constant UNISWAP_SETH = 0xe9Cf7887b93150D4F2Da7dFc6D502B216438F244;
    address internal constant UNISWAP_SXAU = 0x34a0216C5057bC18e5d34D4405284564eFd759b2;
    address internal constant BALANCER_SNX_USDC = 0x815F8eF4863451f4Faf34FBc860034812E7377d9;
    address internal constant BALANCER_SNX_REN = 0x330416C863f2acCE7aF9C9314B422d24c672534a;
    address internal constant LP_REWARD_SUSD = 0xDCB6A51eA3CA5d3Fd898Fd6564757c7aAeC3ca92;
    address internal constant LP_REWARD_IETH = 0xC746bc860781DC90BBFCD381d6A058Dc16357F8d;
    address internal constant LP_REWARD_SETH = 0x48D7f315feDcaD332F68aafa017c7C158BC54760;
    address internal constant LP_REWARD_SXAU = 0x8302FE9F0C509a996573D3Cc5B0D5D51e4FDD5eC;
    address internal constant LP_REWARD_SBTC = 0x13C1542A468319688B89E323fe9A3Be3A90EBb27;
    address internal constant LP_REWARD_BALANCER = 0xFBaEdde70732540cE2B11A8AC58Eb2dC0D69dE10;

    /**
     * @return Amount of SNX locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == SNX) {
            uint256 balance = Synthetix(Proxy(SNX).target()).collateral(account);
            balance += StakingRewards(LP_REWARD_SUSD).earned(account);
            balance += StakingRewards(LP_REWARD_IETH).earned(account);
            balance += StakingRewards(LP_REWARD_SETH).earned(account);
            balance += StakingRewards(LP_REWARD_SXAU).earned(account);
            balance += StakingRewards(LP_REWARD_BALANCER).earned(account);
            return balance;
        } else if (token == BALANCER_SNX_REN) {
            return StakingRewards(LP_REWARD_SBTC).earned(account);
        } else if (token == CURVE_SUSD) {
            return ERC20(LP_REWARD_SUSD).balanceOf(account);
        } else if (token == CURVE_SBTC) {
            return ERC20(LP_REWARD_SBTC).balanceOf(account);
        } else if (token == IETH) {
            return ERC20(LP_REWARD_IETH).balanceOf(account);
        } else if (token == UNISWAP_SETH) {
            return ERC20(LP_REWARD_SETH).balanceOf(account);
        } else if (token == UNISWAP_SXAU) {
            return ERC20(LP_REWARD_SXAU).balanceOf(account);
        } else if (token == BALANCER_SNX_USDC) {
            return ERC20(LP_REWARD_BALANCER).balanceOf(account);
        } else {
            return 0;
        }
    }
}
