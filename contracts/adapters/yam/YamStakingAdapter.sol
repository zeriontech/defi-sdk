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
 * @title Adapter for Yam protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract YamStakingAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant YAM = 0x0e2298E3B3390e3b945a5456fBf59eCc3f55DA16;
    address internal constant YFI = 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e;
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal constant UNISWAP_V2_AMPL_WETH = 0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c;
    address internal constant COMP = 0xc00e94Cb662C3520282E6f5717214004A7f26888;
    address internal constant LINK = 0x514910771AF9Ca656af840dff83E8264EcF986CA;
    address internal constant LEND = 0x80fB784B7eD66730e8b1DBd9820aFD29931aab03;
    address internal constant SNX = 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F;
    address internal constant MKR = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2;

    address internal constant YFI_POOL = 0xc5B6488c7D5BeD173B76Bd5DCA712f45fB9EaEaB;
    address internal constant WETH_POOL = 0x587A07cE5c265A38Dd6d42def1566BA73eeb06F5;
    address internal constant AMPL_POOL = 0x9EbB67687FEE2d265D7b824714DF13622D90E663;
    address internal constant COMP_POOL = 0x8538E5910c6F80419CD3170c26073Ff238048c9E;
    address internal constant LINK_POOL = 0xFDC28897A1E32B595f1f4f1D3aE0Df93B1eee452;
    address internal constant LEND_POOL = 0x6009A344C7F993B16EBa2c673fefd2e07f9be5FD;
    address internal constant SNX_POOL = 0x6c3FC1FFDb14D92394f40eeC91D9Ce8B807f132D;
    address internal constant MKR_POOL = 0xcFe1E539AcB2D489a651cA011a6eB93d32f97E23;

    /**
     * @return Amount of YAM rewards earned after staking in a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == YAM) {
            uint256 totalRewards = 0;
            totalRewards += StakingRewards(YFI_POOL).earned(account);
            totalRewards += StakingRewards(WETH_POOL).earned(account);
            totalRewards += StakingRewards(AMPL_POOL).earned(account);
            totalRewards += StakingRewards(COMP_POOL).earned(account);
            totalRewards += StakingRewards(LINK_POOL).earned(account);
            totalRewards += StakingRewards(LEND_POOL).earned(account);
            totalRewards += StakingRewards(SNX_POOL).earned(account);
            totalRewards += StakingRewards(MKR_POOL).earned(account);
            return totalRewards;
        } else if (token == YFI) {
            return ERC20(YFI_POOL).balanceOf(account);
        } else if (token == WETH) {
            return ERC20(WETH_POOL).balanceOf(account);
        } else if (token == UNISWAP_V2_AMPL_WETH) {
            return ERC20(AMPL_POOL).balanceOf(account);
        } else if (token == COMP) {
            return ERC20(COMP_POOL).balanceOf(account);
        } else if (token == LINK) {
            return ERC20(LINK_POOL).balanceOf(account);
        } else if (token == LEND) {
            return ERC20(LEND_POOL).balanceOf(account);
        } else if (token == SNX) {
            return ERC20(SNX_POOL).balanceOf(account);
        } else if (token == MKR) {
            return ERC20(MKR_POOL).balanceOf(account);
        } else {
            return 0;
        }
    }
}
