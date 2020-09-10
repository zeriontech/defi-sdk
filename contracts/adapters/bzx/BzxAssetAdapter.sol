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
 * @title Asset adapter for bZx protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Roman Iftodi <romeo8881@gmail.com>
 */
contract BzxAssetAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "iToken";

    address public constant BZRXAddress = 0x56d811088235F11C8920698a204A5010a788f4b3;
    
    address public constant vBZRXAddress = 0xB72B31907C1C95F3650b64b2469e08EdACeE5e8F;
    
    /**
     * @return Amount of iTokens held by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token == BZRXAddress) {
            return ERC20(BZRXAddress).balanceOf(account) + ERC20(vBZRXAddress).balanceOf(account);
        } else if(token == vBZRXAddress) {
            return 0;
        } else {
            return ERC20(token).balanceOf(account);
        }
    }
}
