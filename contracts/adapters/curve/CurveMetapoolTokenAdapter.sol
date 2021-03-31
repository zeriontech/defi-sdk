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
 * @dev stableswap contract interface.
 * Only the functions required for CurveMetapoolTokenAdapter contract are added.
 * The stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
// solhint-disable func-name-mixedcase
// solhint-disable-next-line contract-name-camelcase
interface stableswap {
    function coins(uint256) external view returns (address);
    function balances(uint256) external view returns (uint256);
}
// solhint-enable func-name-mixedcase


/**
 * @title Token adapter for Curve Metapool tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveMetapoolTokenAdapter is TokenAdapter {
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

        Component[] memory underlyingComponents = new Component[](2);

        for (uint256 i = 0; i < 2; i++) {
            underlyingComponents[i] = Component({
                token: stableswap(token).coins(i),
                tokenType: "ERC20",
                rate: stableswap(token).balances(i) * 1e18 / ERC20(token).totalSupply()
            });
        }

        return underlyingComponents;
    }
}
