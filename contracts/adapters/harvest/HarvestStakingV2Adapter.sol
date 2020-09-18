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
 * Only the functions required for YearnStakingV1Adapter contract are added.
 * The StakingRewards contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol.
 */
interface StakingRewards {
    function earned(address) external view returns (uint256);
}


/**
 * @title Adapter for Harvest protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract HarvestStakingV2Adapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant FARM = 0xa0246c9032bC3A600820415aE600c6388619A14D;

    address internal constant BPT_CRV_90_FARM_10 = 0xac6bac9Dc3de2c14b420E287De8ECB330d96E492;
    address internal constant BPT_SWRV_90_FARM_10 = 0xf9F2dF6e0e369145481a32Fcd260E353AA20c1a6;
    address internal constant BPT_UNI_V2_SUSD_BASED_90_FARM_10 = 0xf76206115617f090f5a49961a78BCf99BB91cFeE;
    address internal constant BPT_UNI_V2_AMPL_WETH_90_FARM_10 = 0xdFb341093ea062a74Bd19a222c74Abdcb97C067b;
    address internal constant BPT_YFV_90_FARM_10 = 0x97cD8E51cd6C888567c6c620188B8Fb264EE8E91;
    address internal constant BPT_SUSHI_90_FARM_10 = 0xB39Ce7fa5953beBC6697112e88cd11579CBCA579;
    address internal constant BPT_LINK_90_FARM_10 = 0x418d3DfcA5099923Cd57e0Bf9Ed1e9994f515152;
    address internal constant BPT_UNI_V2_PASTA_WETH_90_FARM_10 = 0xa3e69eBCE417eE0508d6996340126aD60078fCDd;
    address internal constant BPT_PYLON_90_FARM_10 = 0x1e2dA0aa71155726C5C0E39AF76Ac0c2e8F74bEF;

    address internal constant UNI_V2_USDT_FUSDT = 0x713f62ccf8545Ff1Df19E5d7Ab94887cFaf95677;
    address internal constant UNI_V2_USDC_FUSDC = 0x4161Fa43eaA1Ac3882aeeD12C5FC05249e533e67;
    address internal constant UNI_V2_DAI_FDAI = 0x007E383BF3c3Ffa12A5De06a53BAb103335eFF28;
    address internal constant UNI_V2_WBTC_FWBTC = 0xaebfeA924DE4080C14DF5C432cECe261934457E0;
    address internal constant UNI_V2_WBTC_FRENBTC = 0x007F74c5C82d68A138Cc3Bc623E51270279fa525;
    address internal constant UNI_V2_WBTC_FCRVWBTC = 0xb6A6a3D8EF31D9FAeb1AB1487aCe79Fe1f5df1BB;
    address internal constant UNI_V2_WETH_FWETH = 0x24b34098F6950a5d5B6BbE1358AD79B609B924fB;
    address internal constant BPT_FARM_20_USDC_80 = 0x0126CfA7EC6B6d4A960b5979943c06a9742af55E;
    address internal constant FWBTC = 0xc07EB91961662D275E2D285BdC21885A4Db136B0;
    address internal constant FRENBTC = 0xfBe122D0ba3c75e1F7C80bd27613c9f35B81FEeC;
    address internal constant FCRVRENWBTC = 0x192E9d29D43db385063799BC239E772c3b6888F3;
    address internal constant FWETH = 0x8e298734681adbfC41ee5d17FF8B0d6d803e7098;

    address internal constant BPT_CRV_90_FARM_10_POOL = 0x45A760B3E83FF8C107C4df955b1483De0982F393;
    address internal constant BPT_SWRV_90_FARM_10_POOL = 0x44356324864A30216e89193bc8b0F6309227d690;
    address internal constant BPT_UNI_V2_SUSD_BASED_90_FARM_10_POOL = 0xf465573288D9D89C6E89b1bc3BC9ce2b997E77dF;
    address internal constant BPT_UNI_V2_AMPL_WETH_90_FARM_10_POOL = 0x7AF4458D3aBD61C3fd187Bb9f1Bbf917Cd4be9B8;
    address internal constant BPT_YFV_90_FARM_10_POOL = 0x158edB94D0bfC093952fB3009DeeED613042907c;
    address internal constant BPT_SUSHI_90_FARM_10_POOL = 0x26582BeA67B30AF166b7FCD3424Ba1E0638Ab136;
    address internal constant BPT_LINK_90_FARM_10_POOL = 0x19f8cE19c9730A1d0db5149e65E48c2f0DAa9919;
    address internal constant BPT_UNI_V2_PASTA_WETH_90_FARM_10_POOL = 0xB4D1D6150dAc0D1A994AfB2A196adadBE639FF95;
    address internal constant BPT_PYLON_90_FARM_10_POOL = 0x2f97D9f870a773186CB01742Ff298777BBF6f244;

    address internal constant UNI_V2_USDT_FUSDT_POOL = 0x316De40F36da4C54AFf11C1D83081555Cca41270;
    address internal constant UNI_V2_USDC_FUSDC_POOL = 0x43286F57cf5981a5db56828dF91a46CfAb983E58;
    address internal constant UNI_V2_DAI_FDAI_POOL = 0xB492fAEdA6c9FFb9B9854a58F28d5333Ff7a11bc;
    address internal constant UNI_V2_WBTC_FWBTC_POOL = 0xBB846aD2552C0669062C9eADfa63148bCbA3e2B0;
    address internal constant UNI_V2_WBTC_FRENBTC_POOL = 0x298a92daf7c71cEd261c79300A620E8BeE54dAa6;
    address internal constant UNI_V2_WBTC_FCRVWBTC_POOL = 0x489c78aa0969118439176C14Af22B3B56bd1d46E;
    address internal constant UNI_V2_WETH_FWETH_POOL = 0x82BdaC405762482f9411a7D970841cE55F64E044;
    address internal constant BPT_FARM_20_USDC_80_POOL = 0x346523a81f16030110e6C858Ee0E11F156840BD1;
    address internal constant FWBTC_POOL = 0x6291eCe696CB6682a9bb1d42fca4160771b1D7CC;
    address internal constant FRENBTC_POOL = 0xCFE1103863F9e7Cf3452Ca8932Eef44d314bf9C5;
    address internal constant FCRVRENWBTC_POOL = 0x5365A2C47b90EE8C9317faC20edC3ce7037384FB;
    address internal constant FWETH_POOL = 0xE11c81b924bB91B44BaE19793539054b48158a9d;

    address internal constant PROFIT_SHARING_FARM_POOL = 0x59258F4e15A5fC74A7284055A8094F58108dbD4f;

    /**
     * @return Amount of staked tokens / rewards earned after staking for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == FARM) {
            uint256 totalRewards = 0;

            totalRewards += StakingRewards(BPT_CRV_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_SWRV_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_UNI_V2_SUSD_BASED_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_UNI_V2_AMPL_WETH_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_YFV_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_SUSHI_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_LINK_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_UNI_V2_PASTA_WETH_90_FARM_10_POOL).earned(account);
            totalRewards += StakingRewards(BPT_PYLON_90_FARM_10_POOL).earned(account);

            totalRewards += StakingRewards(UNI_V2_USDT_FUSDT_POOL).earned(account);
            totalRewards += StakingRewards(UNI_V2_USDC_FUSDC_POOL).earned(account);
            totalRewards += StakingRewards(UNI_V2_DAI_FDAI_POOL).earned(account);
            totalRewards += StakingRewards(UNI_V2_WBTC_FWBTC_POOL).earned(account);
            totalRewards += StakingRewards(UNI_V2_WBTC_FRENBTC_POOL).earned(account);
            totalRewards += StakingRewards(UNI_V2_WBTC_FCRVWBTC_POOL).earned(account);
            totalRewards += StakingRewards(UNI_V2_WETH_FWETH_POOL).earned(account);
            totalRewards += StakingRewards(BPT_FARM_20_USDC_80_POOL).earned(account);
            totalRewards += StakingRewards(FWBTC_POOL).earned(account);
            totalRewards += StakingRewards(FRENBTC_POOL).earned(account);
            totalRewards += StakingRewards(FCRVRENWBTC_POOL).earned(account);
            totalRewards += StakingRewards(FWETH_POOL).earned(account);

            return totalRewards;
        } else if (token == FARM) {
            return ERC20(PROFIT_SHARING_FARM_POOL).balanceOf(account);
        } else if (token == BPT_CRV_90_FARM_10) {
            return ERC20(BPT_CRV_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_SWRV_90_FARM_10) {
            return ERC20(BPT_SWRV_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_UNI_V2_SUSD_BASED_90_FARM_10) {
            return ERC20(BPT_UNI_V2_SUSD_BASED_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_UNI_V2_AMPL_WETH_90_FARM_10) {
            return ERC20(BPT_UNI_V2_AMPL_WETH_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_YFV_90_FARM_10) {
            return ERC20(BPT_YFV_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_SUSHI_90_FARM_10) {
            return ERC20(BPT_SUSHI_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_LINK_90_FARM_10) {
            return ERC20(BPT_LINK_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_UNI_V2_PASTA_WETH_90_FARM_10) {
            return ERC20(BPT_UNI_V2_PASTA_WETH_90_FARM_10_POOL).balanceOf(account);
        } else if (token == BPT_PYLON_90_FARM_10) {
            return ERC20(BPT_PYLON_90_FARM_10_POOL).balanceOf(account);
        } else if (token == UNI_V2_USDT_FUSDT) {
            return ERC20(UNI_V2_USDT_FUSDT_POOL).balanceOf(account);
        } else if (token == UNI_V2_USDC_FUSDC) {
            return ERC20(UNI_V2_USDC_FUSDC_POOL).balanceOf(account);
        } else if (token == UNI_V2_DAI_FDAI) {
            return ERC20(UNI_V2_DAI_FDAI_POOL).balanceOf(account);
        } else if (token == UNI_V2_WBTC_FWBTC) {
            return ERC20(UNI_V2_WBTC_FWBTC_POOL).balanceOf(account);
        } else if (token == UNI_V2_WBTC_FRENBTC) {
            return ERC20(UNI_V2_WBTC_FRENBTC_POOL).balanceOf(account);
        } else if (token == UNI_V2_WBTC_FCRVWBTC) {
            return ERC20(UNI_V2_WBTC_FCRVWBTC_POOL).balanceOf(account);
        } else if (token == UNI_V2_WETH_FWETH) {
            return ERC20(UNI_V2_WETH_FWETH_POOL).balanceOf(account);
        } else if (token == BPT_FARM_20_USDC_80) {
            return ERC20(BPT_FARM_20_USDC_80_POOL).balanceOf(account);
        } else if (token == FWBTC) {
            return ERC20(FWBTC_POOL).balanceOf(account);
        } else if (token == FRENBTC) {
            return ERC20(FRENBTC_POOL).balanceOf(account);
        } else if (token == FCRVRENWBTC) {
            return ERC20(FCRVRENWBTC_POOL).balanceOf(account);
        } else if (token == FWETH) {
            return ERC20(FWETH_POOL).balanceOf(account);
        } else {
            return 0;
        }
    }
}
