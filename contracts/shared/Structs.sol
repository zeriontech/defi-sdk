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

pragma solidity 0.8.11;

import { ActionType, AmountType, PermitType, SwapType } from "./Enums.sol";

//=============================== Adapters Managers Structs ====================================

// The struct consists of adapter name and address
struct AdapterNameAndAddress {
    bytes32 name;
    address adapter;
}

// The struct consists of token and its adapter name
struct TokenAndAdapterName {
    address token;
    bytes32 name;
}

// The struct consists of hash (hash of token's bytecode or address) and its adapter name
struct HashAndAdapterName {
    bytes32 hash;
    bytes32 name;
}

// The struct consists of TokenBalanceMeta structs for
// (base) token and its underlying tokens (if any)
struct FullTokenBalance {
    TokenBalanceMeta base;
    TokenBalanceMeta[] underlying;
}

// The struct consists of TokenBalance struct with token address and absolute amount
// and ERC20Metadata struct with ERC20-style metadata
// 0xEeee...EEeE address is used for Ether
struct TokenBalanceMeta {
    TokenBalance tokenBalance;
    ERC20Metadata erc20metadata;
}

// The struct consists of ERC20-style token metadata
struct ERC20Metadata {
    string name;
    string symbol;
    uint8 decimals;
}

// The struct consists of protocol adapter's name and array of TokenBalance structs
// with token addresses and absolute amounts
struct AdapterBalance {
    bytes32 name;
    TokenBalance[] tokenBalances;
}

// The struct consists of protocol adapter's name and array of supported tokens' addresses
struct AdapterTokens {
    bytes32 name;
    address[] tokens;
}

// The struct consists of token address and its absolute amount (may be negative)
// 0xEeee...EEeE is used for Ether
struct TokenBalance {
    address token;
    int256 amount;
}

//=============================== Interactive Adapters Structs ====================================

// The struct consists of swap type, fee descriptions (share & beneficiary), account address,
// and Caller contract address with call data used for the call
struct SwapDescription {
    SwapType swapType;
    Fee protocolFee;
    Fee marketplaceFee;
    address account;
    address caller;
    bytes callerCallData;
}

// The struct consists of name of the protocol adapter, action type,
// array of token amounts, and some additional data (depends on the protocol)
struct Action {
    bytes32 protocolAdapterName;
    ActionType actionType;
    TokenAmount[] tokenAmounts;
    bytes data;
}

// The struct consists of token address, its amount, and amount type,
// as well as permit type and calldata.
struct Input {
    TokenAmount tokenAmount;
    Permit permit;
}

// The struct consists of permit type and call data
struct Permit {
    PermitType permitType;
    bytes permitCallData;
}

// The struct consists of token address, its amount, and amount type
// 0xEeee...EEeE is used for Ether
struct TokenAmount {
    address token;
    uint256 amount;
    AmountType amountType;
}

// The struct consists of fee share and beneficiary address
struct Fee {
    uint256 share;
    address beneficiary;
}

// The struct consists of deadline and signature
struct ProtocolFeeSignature {
    uint256 deadline;
    bytes signature;
}

// The struct consists of salt and signature
struct AccountSignature {
    uint256 salt;
    bytes signature;
}

// The struct consists of token address and its absolute amount
// 0xEeee...EEeE is used for Ether
struct AbsoluteTokenAmount {
    address token;
    uint256 absoluteAmount;
}
