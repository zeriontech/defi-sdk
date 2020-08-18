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

import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev DSChief contract interface.
 * Only the functions required for MakerGovernanceAdapter contract are added.
 * The DSChief contract is available here
 * github.com/dapphub/ds-chief/blob/master/src/chief.sol.
 */
interface DSChief {
    function deposits(address) external view returns (uint256);
}


/**
 * @title Adapter for Maker Governance.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract MakerGovernanceAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant GOVERNANCE = 0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5;

    /**
     * @return Amount of MKR tokens locked on the Governance module by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        return DSChief(GOVERNANCE).deposits(account);
    }
}
