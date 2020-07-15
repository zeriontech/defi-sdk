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
 * @dev Accounting contract interface.
 * Only the functions required for MelonAdapter contract are added.
 * The Accounting contract is available here
 * github.com/melonproject/protocol/blob/master/src/fund/accounting/Accounting.sol
 */
interface Accounting{
    function performCalculations()
        public
        returns (
            uint gav,
            uint feesInDenominationAsset,
            uint feesInShares,
            uint nav,
            uint sharePrice,
            uint gavPerShareNetManagementFee
        );
}

/**
 * @title Token adapter for Melon Fund Token.
 * @dev Implementation of TokenAdapter interface.
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract MelonTokenAdapter is TokenaAdapter {

  address internal constant MLN = 0xec67005c4E498Ec7f55E092bd1d35cbC47C91892;

  /**
   * @return TokenMetadata struct with ERC20-style token info.
   * @dev Implementation of TokenAdapter interface function.
   */
  function getMetadata(address token) external view override returns (TokenMetadata memory) {
    if (token == MLNF) {
        return TokenMetadata({
            token: MLNF,
            name: "Melon Fund Share Token",
            symbol: "MLNF",
            decimals: ERC20(token).decimals()
        });
    } else {
        return TokenMetadata({
            token: token,
            name: ERC20(token).name(),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }
}


    /**
     * @return Empty Component array.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address) external view override returns (Component[] memory) {
      Component[] memory underlyingTokens = new Component[](1);

      underlyingTokens[0] = Component({
          token: getUnderlying(token),
          tokenType: "ERC20",
          rate: 1e18
      });
}

    function performCalculations()
        public
        returns (
            uint gav,
            uint feesInDenominationAsset,
            uint feesInShares,
            uint nav,
            uint sharePrice,
            uint gavPerShareNetManagementFee
          ){
              return (
                gav,
                feesInDenominationAsset,
                feesInShares,
                nav,
                sharePrice,
                gavPerShareNetManagementFee);
    };
