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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { CompoundRegistry } from "./CompoundRegistry.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundTokenAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function exchangeRateStored() external view returns (uint256);
    function underlying() external view returns (address);
}


/**
 * @title Token adapter for CTokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CompoundTokenAdapter is TokenAdapter("CToken") {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant CSAI = 0xF5DCe57282A584D2746FaF1593d3121Fcac444dC;

    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        Component[] memory underlyingComponents= new Component[](1);

        underlyingComponents[0] = Component({
            token: getUnderlying(token),
            tokenType: "ERC20",
            rate: CToken(token).exchangeRateStored()
        });

        return underlyingComponents;
    }

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getMetadata(address token) public view override returns (TokenMetadata memory) {
        if (token == CSAI) {
            return TokenMetadata({
                token: CSAI,
                tokenType: tokenType,
                name: "Compound Sai",
                symbol: "cSAI",
                decimals: uint8(8)
            });
        } else {
            return super.getMetadata(token);
        }
    }

    /**
     * @dev Internal function to retrieve underlying token.
     */
    function getUnderlying(address token) internal view returns (address) {
        return token == CETH ? ETH : CToken(token).underlying();
    }
}
