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
 * @dev veCRV contract interface
 * Only the functions required for CurveTokenAdapter contract are added.
 * The veCRV contract is available here
 * https://etherscan.io/address/0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2#code
 */
struct LockedBalance {
    int128 amount;
    uint256 end;
}
// solhint-disable-next-line contract-name-camelcase
interface veCRV {
    function locked(address) external view returns (LockedBalance memory);
}

/**
 * @title Token adapter for locked Curve (veCRV) tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveVoteEscrowTokenAdapter is TokenAdapter {

    // Curve DAO token
    address internal constant CRV = 0xD533a949740bb3306d119CC777fa900bA034cd52;
    // Vote-Escrow (locked) CRV
    address internal constant VE_CRV = 0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2;

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: "veCRV",
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        Component[] memory underlyingComponents= new Component[](1);

        LockedBalance memory totalLocked = veCRV(token).locked(msg.sender);

        underlyingComponents[0] = Component({
            token: CRV,
            tokenType: "ERC20",
            // CRV per veCRV
            rate: uint256(totalLocked.amount) / ERC20(token).balanceOf(msg.sender)
        });

        return underlyingComponents;
    }
}