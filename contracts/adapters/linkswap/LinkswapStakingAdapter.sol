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
 * Only the functions required for LinkswapStakingAdapter contract are added.
 * The StakingRewards contract is available here
 * github.com/yflink/linkswap-staking/blob/master/contracts/StakingRewards.sol.
 */
interface StakingRewards {
    function earned(address) external view returns (uint256);
}


/**
 * @title Adapter for LINKSWAP governance and LP rewards staking.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Giovanni Di Siena <giodisiena@gmail.com>
 */
contract LinkswapStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant YFL = 0x28cb7e841ee97947a86B06fA4090C8451f64c0be;
    address internal constant YFLUSD = 0x7b760d06e401f85545f3b50c44bf5b05308b7b62;
    address internal constant SYFL = 0x8282df223ac402d04b2097d16f758af4f70e7db0;
    address internal constant WETH = 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2;
    address internal constant LINK = 0x514910771af9ca656af840dff83e8264ecf986ca;
    address internal constant BUSD = 0x4fabb145d64652a948d72533023f6e7a623c7c53;
    address internal constant USDC = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48;
    address internal constant USDT = 0xdac17f958d2ee523a2206206994597c13d831ec7;
    address internal constant CFI = 0x63b4f3e3fa4e438698ce330e365e831f7ccd1ef4;
    address internal constant MASQ = 0x06F3C323f0238c72BF35011071f2b5B7F43A054c;
    address internal constant DPI = 0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b;
    address internal constant CEL = 0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d;
    address internal constant YAX = 0xb1dc9124c395c1e97773ab855d66e879f053a289;
    address internal constant GSWAP = 0xaac41EC512808d64625576EDdd580e7Ea40ef8B2;
    address internal constant AZUKI = 0x910524678C0B1B23FFB9285a81f99C29C11CBaEd;
    address internal constant DOKI = 0x9ceb84f92a0561fa3cc4132ab9c0b76a59787544;

    address internal constant LSLP_YFL_WETH = 0x7e5A536F3d79791E283940ec379CEE10C9C40e86;
    address internal constant LSLP_YFL_LINK = 0x189a730921550314934019d184ec05726881d481;
    address internal constant LSLP_LINK_YFLUSD = 0x6cd7817e6f3f52123df529e1edf5830240ce48c1;
    address internal constant LSLP_YFLUSD_WETH = 0x195734d862dfb5380eeda0acd8acf697ea95d370;
    address internal constant LSLP_LINK_SYFL = 0x74c89f297b1dc87f927d9432a4eeea697e6f89a5;
    address internal constant LSLP_SYFL_WETH = 0x3315351f0b20595777a28054ef3d514bdc37463d;
    address internal constant LSLP_DPI_LINK = 0x017fad4b7a54c1ace95ca614954e4d0d12cdb27e;
    address internal constant LSLP_LINK_GSWAP = 0xdef0cef53e0d4c6a5e568c53edcf45ceb33dbe46;
    address internal constant LSLP_LINK_CEL = 0x639916bb4b29859fadf7a272185a3212157f8ce1;
    address internal constant LSLP_MASQ_WETH = 0x37cee65899da4b1738412814155540c98dfd752c;
    address internal constant LSLP_BUSD_LINK = 0x983c9a1bcf0eb980a232d1b17bffd6bbf68fe4ce;
    address internal constant LSLP_LINK_YAX = 0x626b88542495d2e341d285969f8678b99cd91da7;
    address internal constant LSLP_YAX_WETH = 0x21dee38170F1e1F26baFf2C30C0fc8F8362b6961;
    address internal constant LSLP_LINK_CFI = 0xf68c01198cddeafb9d2ea43368fc9fa509a339fa;
    address internal constant LSLP_LINK_USDC = 0x9d996bDD1F65C835EE92Cd0b94E15d886EF14D63;
    address internal constant LSLP_LINK_USDT = 0xf36c9fc3c2abe4132019444aff914fc8dc9785a9;
    address internal constant LSLP_LINK_AZUKI = 0xB7Cd446a2a80d4770C6bECde661B659cFC55acf5;
    address internal constant LSLP_LINK_DOKI = 0xbe755C548D585dbc4e3Fe4bcD712a32Fd81e5Ba0;

    address internal constant LSLP_YFL_WETH_POOL = 0x72368fB97dab2B94A5664EbeEbF504EF482fF149;
    address internal constant LSLP_YFL_LINK_POOL = 0x35fc734948b36370c15387342f048ac87210bc22;
    address internal constant LSLP_LINK_YFLUSD_POOL = 0x61401c19200B2420f93Bb2EECF4BAA2C193d76e1;
    address internal constant LSLP_YFLUSD_WETH_POOL = 0x6DddCc7F963C65b18FdDD842e6553528f014aDeA;
    address internal constant LSLP_LINK_SYFL_POOL = 0x1b650B522b864f6BF61705A05cc89b2b0e23f9C6;
    address internal constant LSLP_SYFL_WETH_POOL = 0x81C76925E7F41f0306E1147c4659784d4402bD51;
    address internal constant LSLP_DPI_LINK_POOL = 0xfe04c284a9725c141cf6de85d7e8452af1b48ab7;
    address internal constant LSLP_LINK_GSWAP_POOL = 0x4e33d27cbcce9fe1c4a21a0f7c8b31c9cf5c0b75;
    address internal constant LSLP_LINK_CEL_POOL = 0xfa9712ccc86c6bd52187125dca4c2b9c7baa3ef8;
    address internal constant LSLP_MASQ_WETH_POOL = 0x790adfe75706cf70191b2bd729048e42d8ed9f60;
    address internal constant LSLP_BUSD_LINK_POOL = 0x997d4babf8290a19ecdcbd10058fc438eb6f30de;
    address internal constant LSLP_LINK_YAX_POOL = 0x603065b7e2f69c897f154ca429a2b96cf4703f56;
    address internal constant LSLP_YAX_WETH_POOL = 0xBfe0D843D3DA0953EcEf08Fc231033D4B140a085;
    address internal constant LSLP_LINK_CFI_POOL = 0x5662e09d064781cf2e98732ec3fc7a4a4ab67ea5;
    address internal constant LSLP_LINK_USDC_POOL = 0x0d03cff17367478c3349a579e50259d8a793bbc8;
    address internal constant LSLP_LINK_USDT_POOL = 0x603065b7e2f69c897f154ca429a2b96cf4703f56;
    address internal constant LSLP_LINK_AZUKI_POOL = 0xa74Ef3faB9E94578c79e0077f6Bd572C9efc8733;
    address internal constant LSLP_LINK_DOKI_POOL = 0x795BD26b99082E59478cfe8d9Cd207bb196808E4;

    address internal constant GOVERNANCE = 0x75D1aA733920b14fC74c9F6e6faB7ac1EcE8482E;
    address internal constant GOVERNANCE_FEES = 0x0389d755C1833C9b350d4E8B619Eae16deFc1CbA;

    /**
     * @return Amount of staked tokens / rewards earned after staking for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == YFL) {
            uint256 totalRewards = 0;

            totalRewards += ERC20(GOVERNANCE).balanceOf(account);
            
            totalRewards += StakingRewards(LSLP_YFL_LINK_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_YFL_WETH_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_DPI_LINK_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_MASQ_WETH_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_BUSD_LINK_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_LINK_GSWAP_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_LINK_CEL_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_LINK_YAX_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_LINK_CFI_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_LINK_USDC_POOL).earned(account,0);
            totalRewards += StakingRewards(LSLP_LINK_USDT_POOL).earned(account,0);

            return totalRewards;
        } else if (token == SYFL) {
            uint256 totalRewards = 0;
            totalRewards += StakingRewards(LSLP_LINK_YFLUSD_POOL).earned(account,1);
            totalRewards += StakingRewards(LSLP_YFLUSD_WETH_POOL).earned(account,1);
            totalRewards += StakingRewards(LSLP_LINK_SYFL_POOL).earned(account,1);
            totalRewards += StakingRewards(LSLP_SYFL_WETH_POOL).earned(account,1);
            return totalRewards;
        } else if (token == CFI) {
            return StakingRewards(LSLP_LINK_CFI_POOL).earned(account,1);
        } else if (token == MASQ) {
            return StakingRewards(LSLP_MASQ_WETH_POOL).earned(account,1);
        } else if (token == DPI) {
            return StakingRewards(LSLP_DPI_LINK_POOL).earned(account,1);
        } else if (token == CEL) {
            return StakingRewards(LSLP_LINK_CEL_POOL).earned(account,1);
        } else if (token == YAX) {
            uint256 totalRewards = 0;
            totalRewards += StakingRewards(LSLP_LINK_YAX_POOL).earned(account,1);
            totalRewards += StakingRewards(LSLP_YAX_WETH_POOL).earned(account,1);
            return totalRewards;
        } else if (token == GSWAP) {
            return StakingRewards(LSLP_LINK_GSWAP_POOL).earned(account,1);
        } else if (token == AZUKI) {
            uint256 totalRewards = 0;
            totalRewards += StakingRewards(LSLP_LINK_AZUKI_POOL).earned(account,1);
            totalRewards += StakingRewards(LSLP_LINK_DOKI_POOL).earned(account,1);
            return totalRewards;
        } else if (token == LSLP_YFL_WETH) {
            uint256 total = 0;
            total += ERC20(LSLP_YFL_WETH_POOL).balanceOf(account);
            total += ERC20(LSLP_YFL_WETH).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_YFL_LINK) {
            uint256 total = 0;
            total += ERC20(LSLP_YFL_LINK_POOL).balanceOf(account);
            total += ERC20(LSLP_YFL_LINK).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_YFLUSD) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_YFLUSD_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_YFLUSD).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_YFLUSD_WETH) {
            uint256 total = 0;
            total += ERC20(LSLP_YFLUSD_WETH_POOL).balanceOf(account);
            total += ERC20(LSLP_YFLUSD_WETH).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_SYFL) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_SYFL_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_SYFL).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_SYFL_WETH) {
            uint256 total = 0;
            total += ERC20(LSLP_SYFL_WETH_POOL).balanceOf(account);
            total += ERC20(LSLP_SYFL_WETH).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_DPI_LINK) {
            uint256 total = 0;
            total += ERC20(LSLP_DPI_LINK_POOL).balanceOf(account);
            total += ERC20(LSLP_DPI_LINK).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_MASQ_WETH) {
            uint256 total = 0;
            total += ERC20(LSLP_MASQ_WETH_POOL).balanceOf(account);
            total += ERC20(LSLP_MASQ_WETH).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_BUSD_LINK) {
            uint256 total = 0;
            total += ERC20(LSLP_BUSD_LINK_POOL).balanceOf(account);
            total += ERC20(LSLP_BUSD_LINK).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_GSWAP) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_GSWAP_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_GSWAP).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_CFI) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_CFI_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_CFI).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_CEL) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_CEL_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_CEL).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_YAX) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_YAX_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_YAX).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_YAX_WETH) {
            uint256 total = 0;
            total += ERC20(LSLP_YAX_WETH_POOL).balanceOf(account);
            total += ERC20(LSLP_YAX_WETH).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_USDC) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_USDC_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_USDC).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_USDT) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_USDT_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_USDT).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_AZUKI) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_AZUKI_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_AZUKI).balanceOf(GOVERNANCE_FEES);
            return total
        } else if (token == LSLP_LINK_DOKI) {
            uint256 total = 0;
            total += ERC20(LSLP_LINK_DOKI_POOL).balanceOf(account);
            total += ERC20(LSLP_LINK_DOKI).balanceOf(GOVERNANCE_FEES);
            return total
        } else {
            return 0;
        }
    }
}
