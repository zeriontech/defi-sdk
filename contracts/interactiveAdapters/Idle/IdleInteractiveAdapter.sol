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

import { InteractiveAdapter } from "../InteractiveAdapter.sol";



abstract contract IdleInteractiveAdapter is InteractiveAdapter {


  address internal constant IDLE_DAI = 0x78751B12Da02728F467A44eAc40F5cbc16Bd7934;
  address internal constant IDLE_USDC = 0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6;
  address internal constant IDLE_USDT = 0x63D27B3DA94A9E871222CB0A32232674B02D2f2D;
  address internal constant IDLE_SUSD = 0xE79E177d2a5c7085027d7C64c8F271c81430fc9b;
  address internal constant IDLE_TUSD = 0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1;
  address internal constant IDLE_WBTC = 0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55;

  address internal constant IDLE_DAI_RISK_ADJUSTED = 0x1846bdfDB6A0f5c473dEc610144513bd071999fB;
  address internal constant IDLE_USDC_RISK_ADJUSTED = 0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C;
  address internal constant IDLE_USDT_RISK_ADJUSTED = 0x42740698959761BAF1B06baa51EfBD88CB1D862B;

  address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address internal constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
  address internal constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
  address internal constant SUSD = 0x57Ab1ec28D129707052df4dF418D58a2D46d5f51;
  address internal constant TUSD = 0x0000000000085d4780B73119b644AE5ecd22b376;
  address internal constant WBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;



function getDeposit(address token) internal pure returns (address) {
    if (token == DAI) {
        return IDLE_DAI;
    } else if (token == USDC) {
        return IDLE_USDC;
    } else if (token == USDT) {
        return IDLE_USDT;
    } else if (token == SUSD) {
        return IDLE_SUSD;
    } else if (token == TUSD) {
        return IDLE_TUSD;
    } else if (token == WBTC) {
        return IDLE_WBTC;
    } else {
        revert("IIA: bad token!");
    }
}

function getRiskAdjustedDeposit(address token) internal pure returns (address) {
    if (token == DAI) {
        return IDLE_DAI_RISK_ADJUSTED;
    } else if (token == USDC) {
        return IDLE_USDC_RISK_ADJUSTED;
    } else if (token == USDT) {
        return IDLE_USDT_RISK_ADJUSTED;
    } else {
        revert ("IIA: bad token!");
    }
}
}
