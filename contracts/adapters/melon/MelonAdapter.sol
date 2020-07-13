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
 * @dev Shares contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Shares contract is available here
 * github.com/melonproject/protocol/blob/develop/contracts/fund/shares/Shares.sol.
 */

interface Shares {
    function calcGav() public returns (uint256);
}

/**
 * @dev Accounting contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Accounting contract is available here
 * github.com/melonproject/protocol/blob/master/src/fund/accounting/Accounting.sol
 */

interface Accounting{
    function getFundHoldings() external returns (uint[] memory, address[] memory);
    function performCalculations()
        public
        returns (
            uint gav,
            uint feesInDenominationAsset,  // unclaimed amount
            uint feesInShares,             // unclaimed amount
            uint nav,
            uint sharePrice,
            uint gavPerShareNetManagementFee
        );
}

/**
 * @title adapter for Melon protocol.
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract MelonAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "MelonToken";

    address internal constant MLNF = 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892;

    /**
     * @return Amount of MLNF held by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
      return ERC20(token).balanceOf(account);
    }
}
