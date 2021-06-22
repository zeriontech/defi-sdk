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

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";

interface YToken {
    function token() external view returns (address);

    function getPricePerFullShare() external view returns (uint256);
}

interface AmunLendingToken {
    function limaTokenHelper() external view returns (address);

    function getUnderlyingTokenBalance() external view returns (uint256);

    function getUnderlyingTokenBalanceOf(uint256) external view returns (uint256);
}

interface AmunLendingTokenStorage {
    function currentUnderlyingToken() external view returns (address);

    function limaSwap() external view returns (address);
}

/**
 * @title Token adapter for amun lending tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Timo Hedke <timo@amun.com>
 */
contract AmunLendingTokenAdapter is TokenAdapter {
    /**
     * @return components Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token)
        external
        view
        override
        returns (Component[] memory components)
    {
        uint256 underlyingAmount = AmunLendingToken(token).getUnderlyingTokenBalanceOf(1e18);
        address underlyingToken =
            AmunLendingTokenStorage(AmunLendingToken(token).limaTokenHelper())
                .currentUnderlyingToken();
        components = new Component[](1);

        components[0] = Component({
            token: YToken(underlyingToken).token(),
            rate: int256(
                (underlyingAmount * YToken(underlyingToken).getPricePerFullShare()) / 1e18
            )
        });

        return components;
    }
}
