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
 * @dev Shares contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Shares contract is available here
 * github.com/melonproject/protocol/blob/master/contracts/fund/shares/Shares.sol.
 */
interface Shares {
    function calcGav() external view returns (uint256);
}


/**
 * @dev Registry contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Registrycontract is available here
 * @github.com/melonproject/protocol/blob/master/src/version/Registry.sol.
 */
interface Registry {
    function getSymbol(address _asset) external view returns (string memory);
    function getName(address _asset) external view returns (string memory);
    function isFund(address _who) external view returns (bool);
}

/**
 * @dev Accounting contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Accounting contract is available here
 * github.com/melonproject/protocol/blob/master/src/fund/accounting/Accounting.sol.
 */
interface Accounting{
    function getFundHoldings() external view returns (uint[] memory, address[] memory);
    function calcAssetGAV(address) external view returns (uint);
}

/**
 * @title Token adapter for Melon Protocol by @codingsh.
 * @dev Implementation of TokenAdapter interface.
 * @author codingsh <codingsh@pm.me>
 */
contract MelonTokenAdapter is TokenAdapter {

    address internal constant REGISTRY = 0xb9Cb55C9366a224647B7ff66252b3613185DA0B9;

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: Registry(REGISTRY).getName(token),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {  
        uint[] memory quantities;
        address[] memory fundHoldings;
        try Accounting(token).getFundHoldings() returns (uint[] memory balance, address[] memory result) {
            fundHoldings = result;
            quantities = balance;
        } catch {
            fundHoldings = new address[](0);
            quantities = 0;
        }

        uint256 totalSupply = ERC20(token).totalSupply();

        Component[] memory underlyingTokens = new Component[](fundHoldings.length);

        address underlyingToken;
        for (uint256 i = 0; i < fundHoldings.length; i++) {
            underlyingToken = fundHoldings[i];

            underlyingTokens[i] = Component({
                token: underlyingToken,
                tokenType: "ERC20",
                rate: quantities[i] * 1e18 / totalSupply
            });
        }

        return underlyingTokens;
    }
}
