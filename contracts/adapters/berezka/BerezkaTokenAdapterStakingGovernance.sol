// Copyright (C) 2020 Easy Chain. <https://easychain.tech>
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

import { EnumerableSet } from "./lib/EnumerableSet.sol";
import { Ownable } from "../../Ownable.sol";

struct TypedToken {
    string tokenType;
    address token;
}

/**
 * @dev BerezkaTokenAdapterStakingGovernance contract.
 * Main function of this contract is to maintains a Set of Staking Adapters of Berezka DAO
 * @author Vasin Denis <denis.vasin@easychain.tech>
 */
contract BerezkaTokenAdapterStakingGovernance is Ownable() {

    using EnumerableSet for EnumerableSet.AddressSet;

    /// @dev This is a set of debt protocol adapters that return staked amount of ERC20 tokens
    EnumerableSet.AddressSet private stakings;

    constructor(address[] memory _stakings) public {
        _add(stakings, _stakings);
    }

    // Modification functions (all only by owner)

    function addStakings(address[] memory _stakings) public onlyOwner() {
        require(_stakings.length > 0, "Length should be > 0");

        _add(stakings, _stakings);
    }

    function removeStakings(address[] memory _stakings) public onlyOwner() {
        require(_stakings.length > 0, "Length should be > 0");

        _remove(stakings, _stakings);
    }

    // View functions

    function listStakings() external view returns (address[] memory) {
        return _list(stakings);
    }

    // Internal functions

    function _add(EnumerableSet.AddressSet storage _set, address[] memory _addresses) internal {
        for (uint i = 0; i < _addresses.length; i++) {
            _set.add(_addresses[i]);
        }
    }

    function _remove(EnumerableSet.AddressSet storage _set, address[] memory _addresses) internal {
        for (uint i = 0; i < _addresses.length; i++) {
            _set.remove(_addresses[i]);
        }
    }

    function _list(EnumerableSet.AddressSet storage _set) internal view returns(address[] memory) {
        address[] memory result = new address[](_set.length());
        for (uint i = 0; i < _set.length(); i++) {
            result[i] = _set.at(i);
        }
        return result;
    }
}
