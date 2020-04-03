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

pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;


/**
 * @dev Opium adapter abstract contract.
 * @dev Base contract for Opium adapters.
 * @author Ali Nuraldin <ali@opium.team>
 */
abstract contract OpiumAdapter {
  address internal constant TOKEN_MINTER = 0x9Dd91d61A7aa58537fCdbf16fD21bE25731341B3;
}

/**
 * @dev Opium TokenMinter contract interface.
 * @author Ali Nuraldin <ali@opium.team>
 */
interface OpiumTokenMinter {
  /**
   * @dev ERC721 interface compatible function for position token name retrieving
   * @return Returns name of token
   */
  function name() external view returns (string memory);

  /**
   * @notice ERC721 interface compatible function for position token symbol retrieving
   * @return Returns symbol of token
   */
  function symbol() external view returns (string memory);

  /**
   *  @dev Gets the number of different tokenIds owned by the address we are checking
   *  @param _owner The adddress we are checking
   *  @return balance The unique amount of tokens owned
   */
  function balanceOf(address _owner) external view returns (uint256);
}
