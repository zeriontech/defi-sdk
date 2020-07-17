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
}

/**
 * @dev Version contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Version contract is available here
 * github.com/melonproject/protocol/blob/master/src/version/Version.sol.
 */
interface Version{
    function managersToHubs(address) external view returns (uint256);
}

/**
 * @title Token adapter for Melon Protocol by @codingsh.
 * @dev Implementation of TokenAdapter interface.
 * @author codingsh <codingsh@pm.me>
 */
contract MelonTokenAdapter is TokenAdapter {

    address internal constant REGISTRY = 0xb9Cb55C9366a224647B7ff66252b3613185DA0B9;
    address internal constant VERSION = 0x5f9AE054C7F0489888B1ea46824b4B9618f8A711;

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: getFundName(token),
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
        address hub = getHub(token);
        try Accounting(hub).getFundHoldings() returns (uint[] memory balance, address[] memory result) {
            fundHoldings = result;
            quantities = balance;
        } catch {
            fundHoldings = new address[](0);
            quantities = 0;
        }

        uint256 totalSupply = ERC20(token).totalSupply();

        Component[] memory underlyingTokens = new Component[](fundHoldings.length);

        for (uint256 i = 0; i < fundHoldings.length; i++) {

            underlyingTokens[i] = Component({
                token: fundHoldings[i],
                tokenType: "ERC20",
                rate: quantities[i] * 1e18 / totalSupply
            });
        }

        return underlyingTokens;
    }
    /**
     * @dev Internal function to convert string memory in legible string
     */
    function convert(string memory inputString) internal pure returns (string memory) {
        bytes memory inputBytes = bytes(inputString);
        uint256 resultLength = 0;
        
        for (uint256 i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] != bytes1(0)) {
                resultLength++;
            }
        }
        
        bytes memory result = new bytes(resultLength);
        uint256 counter = 0;
        
        for (uint256 i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] != bytes1(0)) {
                result[counter] = inputBytes[i];
                counter++;
            }
        }
        
        return string(result);
    }
    
    /**
    * @dev Internal function to get Hub address
    */
    function getHub(address fundOwner) internal pure returns (uint256) {
        return Version(VERSION).managersToHubs(fundOwner);
    }

    function getFundName(address token) internal view returns (string memory) {            
        return convert(ERC20(token).name());
    }


}
