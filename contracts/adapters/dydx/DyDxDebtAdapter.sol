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

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { DyDxAdapter } from "./DyDxAdapter.sol";
import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev Info struct from Account library.
 * The Account library is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/lib/Account.sol.
 */
struct Info {
    address owner;  // The address that owns the account
    uint256 number; // A nonce that allows a single address to control many accounts
}


/**
 * @dev Wei struct from Types library.
 * The Types library is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/lib/Types.sol.
 */
struct Wei {
    bool sign; // true if positive
    uint256 value;
}


/**
 * @dev SoloMargin contract interface.
 * Only the functions required for DyDxDebtAdapter contract are added.
 * The SoloMargin contract is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/SoloMargin.sol.
 */
interface SoloMargin {
    function getAccountWei(Info calldata, uint256) external view returns (Wei memory);
}


/**
 * @title Debt adapter for dYdX protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract DyDxDebtAdapter is ProtocolAdapter, DyDxAdapter {

    string public constant override adapterType = "Debt";

    string public constant override tokenType = "ERC20";

    /**
     * @return Amount of tokens held by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) public view override returns (uint256) {
        Wei memory accountWei = SoloMargin(SOLO).getAccountWei(Info(account, 0), getMarketId(token));
        return accountWei.sign ? 0 : accountWei.value;
    }
}
