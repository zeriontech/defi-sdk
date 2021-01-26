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
 * @dev Bank contract interface.
 * Only the functions required for AlphaHomoraTokenAdapter contract are added.
 * The Bank contract is available here
 * github.com/AlphaFinanceLab/alphahomora/blob/master/contracts/5/Bank.sol.
 */
interface Bank {
    function totalETH() external view returns (uint256);
}


/**
 * @title Token adapter for Alpha Homora Interest Bearing ETH.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract AlphaHomoraTokenAdapter is TokenAdapter {

    address internal constant IBETH = 0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A;
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
        uint256 totalSupply = ERC20(token).totalSupply();
        Component[] memory underlyingComponents = new Component[](1);

        underlyingComponents[0] = Component({
            token: ETH,
            tokenType: "ERC20",
            rate: totalSupply == 0 ? 0 : Bank(token).totalETH() * 1e18 / totalSupply
        });

        return underlyingComponents;
    }
}
