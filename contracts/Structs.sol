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


struct ProtocolBalance {
    bytes32 protocolName;
    AdapterBalance[] adapterBalances;
}


struct ProtocolMetadata {
    string name;
    string description;
    string websiteURL;
    string iconURL;
    uint256 version;
}


struct AdapterBalance {
    AdapterMetadata metadata;
    TokenBalance[] balances;
}


// The struct consists of adapter address and
// adapter type, which may be "Asset", "Debt", or "Exchange".
struct AdapterMetadata {
    address adapterAddress;
    bytes32 adapterType;
}


// The struct consists of (base) token and
// its underlying tokens (if exist) balances.
struct FullTokenBalance {
    TokenBalance base;
    TokenBalance[] underlying;
}


struct TokenBalance {
    TokenMetadata metadata;
    uint256 amount;
}


// The struct consists of token address,
// token type, and ERC20-style token metadata.
// NOTE: 0xEeee...EEeE address is used for ETH.
struct TokenMetadata {
    address tokenAddress;
    bytes32 tokenType;
    ERC20Metadata erc20;
}


struct ERC20Metadata {
    string name;
    string symbol;
    uint8 decimals;
}


// The struct consists of token address,
// token type, and price per full share (1e18).
struct Component {
    address tokenAddress;
    bytes32 tokenType;
    uint256 rate;
}


//================================InteractiveAdapters structs=====================================


struct TransactionData {
    Action[] actions;
    Input[] inputs;
    Output[] outputs;
    uint256 nonce;
}


struct Action {
    ActionType actionType;
    bytes32 protocolName;
    uint256 adapterIndex;
    address[] tokens;
    uint256[] amounts;
    AmountType[] amountTypes;
    bytes data;
}


struct Input {
    address token;
    uint256 amount;
    AmountType amountType;
    uint256 fee;
    address beneficiary;
}


struct Output {
    address token;
    uint256 amount;
}


enum ActionType { None, Deposit, Withdraw }


enum AmountType { None, Relative, Absolute }
