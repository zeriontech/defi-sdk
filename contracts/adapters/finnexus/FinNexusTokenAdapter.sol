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
 * @dev OptionsManagerV2 contract interface.
 * Only the functions required for FinNexusTokenAdapter contract are added.
 */
interface OptionsManagerV2 {
    function getTokenNetworth() external view returns (uint256);
}


/**
 * @dev FNXOracle contract interface.
 * Only the functions required for FinNexusTokenAdapter contract are added.
 */
interface FNXOracle {
    function getPrice(address asset) external view returns (uint256);
}


/**
 * @title Token adapter for FinNexus.
 * @dev Implementation of TokenAdapter interface.
 * @author jeffqg123 <forestjqg@163.com>
 */
contract FinNexusTokenAdapter is TokenAdapter {

    address public  constant optManager = 0xfa30ec96De9840A611FcB64e7312f97bdE6e155A;
    address public  constant oracle = 0x940b491905529542Ba3b56244A06B1EBE11e71F2;

    address[] internal underlyingAddress = [0x0000000000000000000000000000000000000000,0xeF9Cd7882c067686691B6fF49e650b43AFBBCC6B,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48];
                                                           //  ,
                                                           //  ];
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
    function getComponents(address) external view override returns (Component[] memory) {
        
        Component[] memory underlyingTokens = new Component[](underlyingAddress.length);

        for (uint256 i = 0; i < underlyingTokens.length; i++) {
            uint256 fptWorth = OptionsManagerV2(optManager).getTokenNetworth();
            uint256 tokenPrice = FNXOracle(oracle).getPrice(underlyingAddress[i]);
            underlyingTokens[i] = Component({
                token: i==0?0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE:underlyingAddress[i],
                tokenType: "ERC20",
                rate: tokenPrice/fptWorth
            });
        }

        return underlyingTokens;
    }
}
