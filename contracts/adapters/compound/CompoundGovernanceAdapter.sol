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

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { CToken } from "../../interfaces/CToken.sol";

/**
 * @dev CompMarketState contract interface.
 * Only the functions required for CompoundGovernanceAdapter contract are added.
 * The CompMarketState struct is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/ComptrollerStorage.sol.
 */
struct CompMarketState {
    uint224 index;
    uint32 block;
}

/**
 * @dev Comptroller contract interface.
 * Only the functions required for CompoundGovernanceAdapter contract are added.
 * The Comptroller contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/Comptroller.sol.
 */
interface Comptroller {
    function getAllMarkets() external view returns (address[] memory);

    function compBorrowState(address) external view returns (CompMarketState memory);

    function compSupplyState(address) external view returns (CompMarketState memory);

    function compBorrowerIndex(address, address) external view returns (uint256);

    function compSupplierIndex(address, address) external view returns (uint256);

    function compAccrued(address) external view returns (uint256);
}

/**
 * @title Asset adapter for Compound Governance.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CompoundGovernanceAdapter is ProtocolAdapter {
    address internal constant COMPTROLLER = 0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B;

    /**
     * @return Amount of unclaimed COMP by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address, address account) public view override returns (int256) {
        uint256 balance = Comptroller(COMPTROLLER).compAccrued(account);
        address[] memory allMarkets = Comptroller(COMPTROLLER).getAllMarkets();

        for (uint256 i = 0; i < allMarkets.length; i++) {
            balance += borrowerComp(account, allMarkets[i]);
            balance += supplierComp(account, allMarkets[i]);
        }

        return int256(balance);
    }

    function borrowerComp(address account, address cToken) internal view returns (uint256) {
        uint256 borrowerIndex = Comptroller(COMPTROLLER).compBorrowerIndex(cToken, account);

        if (borrowerIndex > 0) {
            uint256 borrowIndex = uint256(Comptroller(COMPTROLLER).compBorrowState(cToken).index);
            require(borrowIndex >= borrowerIndex, "CGA: underflow");
            uint256 deltaIndex = borrowIndex - borrowerIndex;
            uint256 borrowerAmount =
                mul(CToken(cToken).borrowBalanceStored(account), 1e18) /
                    CToken(cToken).borrowIndex();
            uint256 borrowerDelta = mul(borrowerAmount, deltaIndex) / 1e36;
            return borrowerDelta;
        } else {
            return 0;
        }
    }

    function supplierComp(address account, address cToken) internal view returns (uint256) {
        uint256 supplierIndex = Comptroller(COMPTROLLER).compSupplierIndex(cToken, account);
        uint256 supplyIndex = uint256(Comptroller(COMPTROLLER).compSupplyState(cToken).index);
        if (supplierIndex == 0 && supplyIndex > 0) {
            supplierIndex = 1e36;
        }
        require(supplyIndex >= supplierIndex, "CGA: underflow");
        uint256 deltaIndex = supplyIndex - supplierIndex;
        uint256 supplierAmount = CToken(cToken).balanceOf(account);
        uint256 supplierDelta = mul(supplierAmount, deltaIndex) / 1e36;

        return supplierDelta;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "CGA: mul overflow");

        return c;
    }
}
