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
 * @dev FinNexusCollecteralPool contract interface.
 */
interface FinNexusCollecteralPool {
    function getUserInputCollateral(address user,address collateral)public view returns (uint256);
}


/**
 * @title Asset adapter for FinNexus option protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author jeffqg123 <forestjqg@163.com>
 */
contract FinNexusDebtAdapter is ProtocolAdapter {

    string public constant override adapterType = "Debt";
    string public constant override tokenType = "ERC20";

    address public constant CollecteralPool = 0x2071bc1cefd2e2beb7e81db0c7517e7b40c6c10a;
    address internal constant FNX = 0xeF9Cd7882c067686691B6fF49e650b43AFBBCC6B;
    address internal constant FNX_ETH = 0x0000000000000000000000000000000000000000;
    address internal constant USDC= 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @return Amount of FNX/USDC/FNX locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token==FNX || token==ETH || token==USDC) {
            return FinNexusCollecteralPool(CollecteralPool).getUserInputCollateral(account,token==ETH?FNX_ETH:token);
        } else {
            return 0;
        }
    }
}
