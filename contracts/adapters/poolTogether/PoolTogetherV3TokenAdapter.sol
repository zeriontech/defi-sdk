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
 * @dev ControlledToken contract interface.
 * Only the functions required for PoolTogetherV3TokenAdapter contract are added.
 * The ControlledToken contract is available here
 * github.com/pooltogether/pooltogether-pool-contracts/blob/master/contracts/token/ControlledToken.sol.
 */
interface ControlledToken {
    function controller() external view returns (address);
}


/**
 * @dev PrizePool contract interface.
 * Only the functions required for PoolTogetherV3TokenAdapter contract are added.
 * The PrizePool contract is available here
 * github.com/pooltogether/pooltogether-pool-contracts/blob/master/contracts/prize-pool/PrizePool.sol.
 */
interface PrizePool {
    function token() external view returns (address);
}


/**
 * @title Token adapter for PoolTogether V3 tickets.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract PoolTogetherV3TokenAdapter is TokenAdapter {

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
        Component[] memory underlyingTokens = new Component[](1);

        underlyingTokens[0] = Component({
            token: PrizePool(ControlledToken(token).controller()).token(),
            tokenType: "ERC20",
            rate: 1e18
        });

        return underlyingTokens;
    }
}
