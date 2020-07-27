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

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { Action, AmountType } from "../../shared/Structs.sol";
import { IdleAdapter } from "../../adapters/idle/IdleAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


interface IdleTokenV3 {
    function mintIdleToken(uint256, uint256) external returns (uint256);
}

contract IdleTokenInteractiveAdapter is InteractiveAdapter, IdleAdapter, {
  using SafeERC20 for ERC20;

  address internal constant IdleDAI = 0x78751B12Da02728F467A44eAc40F5cbc16Bd7934;
  address internal constant IdleUSDC = 0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6;
  address internal constant IdleUSDT = 0x63D27B3DA94A9E871222CB0A32232674B02D2f2D;
  address internal constant IdleSUSD = 0xe79e177d2a5c7085027d7c64c8f271c81430fc9b;
  address internal constant IdleTUSD = 0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1;
  address internal constant IdleWBTC = 0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55;
  address internal constant IdleDAI_Risk_Adjusted = 0x1846bdfDB6A0f5c473dEc610144513bd071999fB;
  address internal constant IdleUSDC_Risk_Adjusted = 0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C;
  address internal constant IdleUSDT_Risk_Adjusted = 0x42740698959761BAF1B06baa51EfBD88CB1D862B;


}
