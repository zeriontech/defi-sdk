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
 * @dev SavingsContract contract interface.
 * Only the functions required for MstableAssetAdapter contract are added.
 * The SavingsContract contract is available here
 * github.com/mstable/mStable-contracts/blob/master/contracts/savings/SavingsContract.sol.
 */
interface SavingsContract {
    function creditBalances(address) external view returns (uint256);
    function exchangeRate() external view returns (uint256);
}


/**
 * @title Asset adapter for mStable protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract MstableAssetAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

string public constant override tokenType = "Masset";

address internal constant SAVINGS = 0xcf3F73290803Fc04425BEE135a4Caeb2BaB2C2A1;

uint256 internal constant FULL_SCALE = 1e18;

/**
 * @return Amount of mUSD owned and locked on the protocol by the given account.
 * @dev Implementation of ProtocolAdapter interface function.
 */
function getBalance(address, address account) external view override returns (uint256) {
uint256 credits = SavingsContract(SAVINGS).creditBalances(account);
uint256 exchangeRate = SavingsContract(SAVINGS).exchangeRate();

return credits * exchangeRate / FULL_SCALE;
}
}
