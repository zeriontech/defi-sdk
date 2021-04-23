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
import { TokenMetadata, Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


/**
 * @dev BassetPersonal struct.
 * The BassetPersonal struct is available here
 * github.com/mstable/mStable-contracts/blob/master-v2/contracts/masset/MassetStructs.sol.
 */
struct BassetPersonal {
    address addr;
    address integrator;
    bool hasTxFee;
    uint8 status;
}


/**
 * @dev BassetData struct.
 * The BassetData struct is available here
 * github.com/mstable/mStable-contracts/blob/master-v2/contracts/masset/MassetStructs.sol.
 */
struct BassetData {
    uint128 ratio;
    uint128 vaultBalance;
}


/**
 * @dev Masset contract interface.
 * Only the functions required for MassetTokenAdapter contract are added.
 * The Masset contract is available here
 * github.com/mstable/mStable-contracts/blob/master-v2/contracts/masset/Masset.sol.
 */
interface Masset {
    function getBassets() external view returns (BassetPersonal[] memory, BassetData[] memory);
}


/**
 * @title Token adapter for mStable Masset.
 * @dev Implementation of TokenAdapter interface.
 */
contract MstableTokenAdapter is TokenAdapter {

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: ERC20(token).name(),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        (BassetPersonal[] memory personal, BassetData[] memory data) = Masset(token).getBassets();
        uint256 length = data.length;
        uint256[] memory scaledAmounts = new uint256[](length);
        uint256 scaledAmountsSum = 0;

        for (uint256 i = 0; i < length; i++) {
            scaledAmounts[i] = data[i].vaultBalance * data[i].ratio / 1e8;
            scaledAmountsSum += scaledAmounts[i];
        }

        Component[] memory underlyingTokens = new Component[](length);
        for (uint256 i = 0; i < length; i++) {
            underlyingTokens[i] = Component({
                token: personal[i].addr,
                tokenType: "ERC20",
                rate: (scaledAmounts[i] * 1e18 / scaledAmountsSum) * 1e8 / data[i].ratio
            });
        }

        return underlyingTokens;
    }
}
