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

import {ERC20} from "../../ERC20.sol";
import {ProtocolAdapter} from "../ProtocolAdapter.sol";

/**
 * @dev veCRV contract interface
 * Only the functions required for CurveTokenAdapter contract are added.
 * The veCRV contract is available here
 * https://etherscan.io/address/0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2#code
 */
interface Locker {
    function locked(address)
        external
        view
        returns (
            int128, /* amount */
            uint256 /* end */
        );
}

/**
 * @title Adapter for Curve protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract CurveVoteEscrowAdapter is ProtocolAdapter {
    string public constant override adapterType = "Asset";
    string public constant override tokenType = "Vote-escrowed CRV";

    // Curve DAO token
    address internal constant CRV = 0xD533a949740bb3306d119CC777fa900bA034cd52;
    // Vote-Escrow (locked) CRV
    address internal constant VE_CRV =
        0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2;

    /**
     * @return Amount of Curve pool tokens locked as veCRV by the given account.
     * @param token Address of the pool token
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account)
        external
        view
        override
        returns (uint256)
    {
        if (token == CRV) {
            (int128 balance, ) = Locker(VE_CRV).locked(account);
            return uint256(balance);
        }
        return 0;
    }
}
