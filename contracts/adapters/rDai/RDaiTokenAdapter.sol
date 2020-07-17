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
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract RDaiTokenAdapter is TokenAdapter {

  /**
   * @dev rDAI contract address is proxy contract.
   */
    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

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
     * @return Empty Component array.
     * @dev Implementation of TokenAdapter interface function.
     # @dev rDAI is DAI invested in Compound as cDAI, you can query the cDAI exchangeRateStored in the CompoundAllocationStrategy.sol contrac
     */
     function getComponents(address) external view override returns (Component[] memory) {
         Component[] memory underlyingTokens = new Component[](1);

         underlyingTokens[0] = Component({
             token: DAI,
             tokenType: "ERC20",
             rate: 1e18
         });

         return underlyingTokens;
     }
}
