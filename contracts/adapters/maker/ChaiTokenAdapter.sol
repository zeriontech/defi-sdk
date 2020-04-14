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
import { MKRAdapter } from "./MKRAdapter.sol";


/**
 * @dev Pot contract interface.
 * Only the functions required for ChaiTokenAdapter contract are added.
 * The Pot contract is available here
 * github.com/makerdao/dss/blob/master/src/pot.sol.
 */
interface Pot {
    function pie(address) external view returns (uint256);
    function dsr() external view returns (uint256);
    function rho() external view returns (uint256);
    function chi() external view returns (uint256);
}


/**
 * @title Token adapter for Chai tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ChaiTokenAdapter is TokenAdapter, MKRAdapter {

    /**
     * @return TokenMetadata struct with ERC20-style token metadata.
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
    function getComponents(address) external view override returns (Component[] memory) {
        Pot pot = Pot(POT);
        Component[] memory underlyingTokens = new Component[](1);

        underlyingTokens[0] = Component({
            token: DAI,
            tokenType: "ERC20",
            // solhint-disable-next-line not-rely-on-time
            rate: mkrRmul(mkrRmul(mkrRpow(pot.dsr(), now - pot.rho(), ONE), pot.chi()), 1e18)
        });

        return underlyingTokens;
    }
}
