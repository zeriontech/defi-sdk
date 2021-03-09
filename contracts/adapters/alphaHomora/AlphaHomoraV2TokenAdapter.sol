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
 * @dev SafeBox contract interface.
 * Only the functions required for AlphaHomoraV2TokenAdapter contract are added.
 * The SafeBox contract is available here
 * github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/SafeBox.sol.
 */
interface SafeBox {
    function cToken() external view returns (address);
    function uToken() external view returns (address);
}


/**
 * @dev CToken contract interface.
 * Only the functions required for AlphaHomoraV2TokenAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function exchangeRateStored() external view returns (uint256);
}


/**
 * @title Token adapter for Alpha Homora V2 Interest Bearing tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AlphaHomoraV2TokenAdapter is TokenAdapter {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

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
        address underlyingToken;

        try SafeBox(token).uToken() returns (address uToken) {
            underlyingToken = uToken;
        } catch {
            underlyingToken = ETH;
        }

        Component[] memory underlyingComponents = new Component[](1);

        underlyingComponents[0] = Component({
            token: underlyingToken,
            tokenType: "ERC20",
            rate: CToken(SafeBox(token).cToken()).exchangeRateStored()
        });

        return underlyingComponents;
    }
}
