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
    function earned(address, uint256) external view returns (uint256);
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
    address internal constant YFLUSD = 0x7b760D06E401f85545F3B50c44bf5B05308b7b62;
    address internal constant SYFL = 0x8282df223AC402d04B2097d16f758Af4F70e7Db0;
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal constant LINK = 0x514910771AF9Ca656af840dff83E8264EcF986CA;
    address internal constant BUSD = 0x4Fabb145d64652a948d72533023f6E7A623C7C53;
    address internal constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address internal constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address internal constant CFI = 0x63b4f3e3fa4e438698CE330e365E831F7cCD1eF4;
    address internal constant MASQ = 0x06F3C323f0238c72BF35011071f2b5B7F43A054c;
    address internal constant DPI = 0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b;
    address internal constant CEL = 0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d;
    address internal constant YAX = 0xb1dC9124c395c1e97773ab855d66E879f053A289;
    address internal constant GSWAP = 0xaac41EC512808d64625576EDdd580e7Ea40ef8B2;
    address internal constant AZUKI = 0x910524678C0B1B23FFB9285a81f99C29C11CBaEd;
    address internal constant DOKI = 0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544;

    address internal constant LSLP_YFL_WETH = 0x7e5A536F3d79791E283940ec379CEE10C9C40e86;
    address internal constant LSLP_YFL_LINK = 0x189A730921550314934019d184EC05726881D481;
    address internal constant LSLP_LINK_YFLUSD = 0x6cD7817e6f3f52123df529E1eDF5830240Ce48c1;
    address internal constant LSLP_YFLUSD_WETH = 0x195734d862DFb5380eeDa0ACD8acf697eA95D370;
    address internal constant LSLP_LINK_SYFL = 0x74C89f297b1dC87F927d9432a4eeea697E6f89a5;
    address internal constant LSLP_SYFL_WETH = 0x3315351F0B20595777a28054EF3d514bdC37463d;
    address internal constant LSLP_DPI_LINK = 0x017FAD4b7a54C1ACe95Ca614954e4D0d12CDb27E;
    address internal constant LSLP_LINK_GSWAP = 0xdef0CEF53E0D4c6A5E568c53EdCf45CeB33DBE46;
    address internal constant LSLP_LINK_CEL = 0x639916bB4B29859FADF7A272185a3212157F8CE1;
    address internal constant LSLP_MASQ_WETH = 0x37CeE65899dA4B1738412814155540C98DFd752C;
    address internal constant LSLP_BUSD_LINK = 0x983c9a1BCf0eB980a232D1b17bFfd6Bbf68Fe4Ce;
    address internal constant LSLP_LINK_YAX = 0x626B88542495d2e341d285969F8678B99cd91DA7;
    address internal constant LSLP_YAX_WETH = 0x21dee38170F1e1F26baFf2C30C0fc8F8362b6961;
    address internal constant LSLP_LINK_CFI = 0xf68c01198cDdEaFB9d2EA43368FC9fA509A339Fa;
    address internal constant LSLP_LINK_USDC = 0x9d996bDD1F65C835EE92Cd0b94E15d886EF14D63;
    address internal constant LSLP_LINK_USDT = 0xf36c9fc3c2aBE4132019444AfF914Fc8DC9785a9;
    address internal constant LSLP_LINK_AZUKI = 0xB7Cd446a2a80d4770C6bECde661B659cFC55acf5;
    address internal constant LSLP_LINK_DOKI = 0xbe755C548D585dbc4e3Fe4bcD712a32Fd81e5Ba0;

    address internal constant LSLP_YFL_WETH_POOL = 0x72368fB97dab2B94A5664EbeEbF504EF482fF149;
    address internal constant LSLP_YFL_WETH_POOL_NEW = 0x3bE07ed0239d46ca8435D4fb0bE96E43cD1c1796;
    address internal constant LSLP_YFL_LINK_POOL = 0x35FC734948B36370c15387342F048aC87210bC22;
    address internal constant LSLP_LINK_YFLUSD_POOL = 0x61401c19200B2420f93Bb2EECF4BAA2C193d76e1;
    address internal constant LSLP_YFLUSD_WETH_POOL = 0x6DddCc7F963C65b18FdDD842e6553528f014aDeA;
    address internal constant LSLP_LINK_SYFL_POOL = 0x1b650B522b864f6BF61705A05cc89b2b0e23f9C6;
    address internal constant LSLP_SYFL_WETH_POOL = 0x81C76925E7F41f0306E1147c4659784d4402bD51;
    address internal constant LSLP_DPI_LINK_POOL = 0xFe04c284a9725c141CF6de85D7E8452af1B48ab7;
    address internal constant LSLP_LINK_GSWAP_POOL = 0x4e33D27CBCCe9Fe1c4a21A0f7C8b31C9CF5c0B75;
    address internal constant LSLP_LINK_CEL_POOL = 0xfa9712cCc86c6BD52187125dCA4c2B9C7bAa3Ef8;
    address internal constant LSLP_MASQ_WETH_POOL = 0x790aDfE75706cf70191b2bD729048e42d8Ed9f60;
    address internal constant LSLP_BUSD_LINK_POOL = 0x997d4BAbf8290A19EcDCbD10058fC438EB6F30DE;
    address internal constant LSLP_LINK_YAX_POOL = 0xf4C17025B623665AAcAb958FC0fa454b1265A219;
    address internal constant LSLP_YAX_WETH_POOL = 0xBfe0D843D3DA0953EcEf08Fc231033D4B140a085;
    address internal constant LSLP_LINK_CFI_POOL = 0x5662E09d064781Cf2E98732ec3fC7A4a4aB67eA5;
    address internal constant LSLP_LINK_USDC_POOL = 0x0D03Cff17367478c3349a579e50259D8A793BBc8;
    address internal constant LSLP_LINK_USDT_POOL = 0x603065B7e2F69c897F154Ca429a2B96Cf4703f56;
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
            totalRewards += StakingRewards(LSLP_YFL_WETH_POOL_NEW).earned(account,0);
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
            total += ERC20(LSLP_YFL_WETH_POOL_NEW).balanceOf(account);
            total += ERC20(LSLP_YFL_WETH).balanceOf(GOVERNANCE_FEES);
return total;
        } else if (token == LSLP_YFL_LINK) {
uint256 total = 0;
total += ERC20(LSLP_YFL_LINK_POOL).balanceOf(account);
total += ERC20(LSLP_YFL_LINK).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_YFLUSD) {
uint256 total = 0;
total += ERC20(LSLP_LINK_YFLUSD_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_YFLUSD).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_YFLUSD_WETH) {
uint256 total = 0;
total += ERC20(LSLP_YFLUSD_WETH_POOL).balanceOf(account);
total += ERC20(LSLP_YFLUSD_WETH).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_SYFL) {
uint256 total = 0;
total += ERC20(LSLP_LINK_SYFL_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_SYFL).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_SYFL_WETH) {
uint256 total = 0;
total += ERC20(LSLP_SYFL_WETH_POOL).balanceOf(account);
total += ERC20(LSLP_SYFL_WETH).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_DPI_LINK) {
uint256 total = 0;
total += ERC20(LSLP_DPI_LINK_POOL).balanceOf(account);
total += ERC20(LSLP_DPI_LINK).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_MASQ_WETH) {
uint256 total = 0;
total += ERC20(LSLP_MASQ_WETH_POOL).balanceOf(account);
total += ERC20(LSLP_MASQ_WETH).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_BUSD_LINK) {
uint256 total = 0;
total += ERC20(LSLP_BUSD_LINK_POOL).balanceOf(account);
total += ERC20(LSLP_BUSD_LINK).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_GSWAP) {
uint256 total = 0;
total += ERC20(LSLP_LINK_GSWAP_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_GSWAP).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_CFI) {
uint256 total = 0;
total += ERC20(LSLP_LINK_CFI_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_CFI).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_CEL) {
uint256 total = 0;
total += ERC20(LSLP_LINK_CEL_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_CEL).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_YAX) {
uint256 total = 0;
total += ERC20(LSLP_LINK_YAX_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_YAX).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_YAX_WETH) {
uint256 total = 0;
total += ERC20(LSLP_YAX_WETH_POOL).balanceOf(account);
total += ERC20(LSLP_YAX_WETH).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_USDC) {
uint256 total = 0;
total += ERC20(LSLP_LINK_USDC_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_USDC).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_USDT) {
uint256 total = 0;
total += ERC20(LSLP_LINK_USDT_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_USDT).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_AZUKI) {
uint256 total = 0;
total += ERC20(LSLP_LINK_AZUKI_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_AZUKI).balanceOf(GOVERNANCE_FEES);
return total;
} else if (token == LSLP_LINK_DOKI) {
uint256 total = 0;
total += ERC20(LSLP_LINK_DOKI_POOL).balanceOf(account);
total += ERC20(LSLP_LINK_DOKI).balanceOf(GOVERNANCE_FEES);
return total;
} else {
            return 0;
        }
    }
}
