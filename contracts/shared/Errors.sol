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

pragma solidity 0.8.4;

import { ActionType, AmountType, PermitType, SwapType } from "./Enums.sol";

error BadAccountFromSignature(address accountFromSignature, address requiredAccount);
error BadAbsoluteInputAmount(uint256 absoluteInputAmount, uint256 requiredAbsoluteInputAmount);
error BadAmountType(AmountType amountType, AmountType requiredAmountType);
error BadGetExactInputAmountCallData(bytes callData);
error BadGetExactInputAmountReturnData(bytes returnData);
error BadLength(uint256 length, uint256 requiredLength);
error BadMsgSender(address msgSender, address requiredMsgSender);
error BadProtocolAdapterName(bytes32 protocolAdapterName);

error ExceedingLimitAmount(uint256 amount);
error ExceedingLimitFee(uint256 fee);

error InsufficientMsgValue(uint256 msgValue, uint256 requiredMsgValue);
error InsufficientOutputBalanceChange(
    uint256 outputBalanceChange,
    uint256 requiredOutputBalanceChange
);

error LargeExactInputAmount(uint256 exactInputAmount, uint256 requiredExactInputAmoun);
error LargeInputBalanceChange(uint256 inputBalanceChange, uint256 requiredInputBalanceChange);

error NoneActionType();
error NoneAmountType();
error NonePermitType();
error NoneSwapType();

error NotImplemented();

error UsedHash(bytes32 hash, address account);

error ZeroAmountOut();
error ZeroBeneficiary();
error ZeroLength();
error ZeroLiquidity();
error ZeroProtocolAdapterRegistry();
error ZeroSwapPath();
