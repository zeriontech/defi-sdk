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


interface LiquidityProtectionStore {
    function lockedBalanceRange(
        address,
        uint256,
        uint256
    )
        external
        view
        returns (uint256[] memory, uint256[] memory);

    function lockedBalanceCount(address) external view returns (uint256);
}


/**
 * @title Adapter for Bancor protocol (locked tokens).
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BancorAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant override LPS = 0xf5FAB5DBD2f3bf675dE4cB76517d4767013cfB55;
    address internal constant override BNT = 0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C;

    /**
     * @return Amount of SmartTokens locked in LiquidityProtection.
     * @param token Address of the smart token.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token != BNT) {
            return 0;
        } else {
            LiquidityProtectionStore liquidityProtectionStore = LiquidityProtectionStore(LPS);
            (uint256[] memory lockedBalances,) = liquidityProtectionStore.lockedBalanceRange(
                account,
                0,
                liquidityProtectionStore.lockedBalanceCount(account)
            );

            uint256 totalAmount = 0;
            uint256 length = lockedBalances.length;
            for (uint256 i = 0; i < length; i++) {
                totalAmount += lockedBalances[i];
            }

            return totalAmount;
        }
    }
}
