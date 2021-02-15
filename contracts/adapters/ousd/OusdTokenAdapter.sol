// Copyright (C) 2021 Zerion Inc. <https://zerion.io>
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
 * @dev VaultLib contract interface.
 * Only the functions required for OusdTokenAdapter contract are added.
 */
interface VaultLib {
    function checkBalance(address _asset) external view returns (uint256);
    function getAllAssets() external view returns (address[] memory);
}

/**
 * @dev OUSD contract interface.
 * Only the functions required for OusdTokenAdapter contract are added.
 */
interface OusdLib {
    function vaultAddress() external view returns (address);
}


/**
 * @title Token adapter for Enzyme Protocol.
 * @dev Implementation of TokenAdapter interface.
 * @author Domen Grabec
 */
contract OusdTokenAdapter is TokenAdapter {

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

    /**“
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        uint256 totalSupply = ERC20(token).totalSupply();
        address vaultAddress = OusdLib(token).vaultAddress();

        address[] memory trackedAssets = VaultLib(vaultAddress).getAllAssets();
        uint256 length = trackedAssets.length;

        Component[] memory underlyingTokens = new Component[](length);

        // total supply: 6439222431166549810954050
        // 

        for (uint256 i = 0; i < length; i++) {
            underlyingTokens[i] = Component({
                token: trackedAssets[i],
                tokenType: "ERC20",
                rate: totalSupply == 0 ? 0 : VaultLib(vaultAddress).checkBalance(trackedAssets[i]) * 1e18 / totalSupply
                // maybe this?: rate: totalSupply == 0 ? 0 : VaultLib(vaultAddress).checkBalance(trackedAssets[i]) * ERC20(trackedAssets[i]).decimals() / totalSupply
            });
        }

        return underlyingTokens;
    }
}
