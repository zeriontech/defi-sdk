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

import { ERC20 } from "../../interfaces/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { IAmunLendingToken } from "../../interfaces/IAmunLendingToken.sol";
import { IAmunLendingTokenStorage } from "../../interfaces/IAmunLendingTokenStorage.sol";
import { YVault } from "../../interfaces/YVault.sol";

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
        uint256 underlyingAmount = IAmunLendingToken(token).getUnderlyingTokenBalanceOf(1e18);
        address underlyingToken =
            IAmunLendingTokenStorage(IAmunLendingToken(token).limaTokenHelper())
                .currentUnderlyingToken();

        components = new Component[](1);

        components[0] = Component({
            token: YVault(underlyingToken).token(),
            rate: int256(
                (underlyingAmount * YVault(underlyingToken).getPricePerFullShare()) / 1e18
            )
        });

        return components;
    }
}
