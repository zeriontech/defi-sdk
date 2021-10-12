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
import { ProtocolAdapter } from "../ProtocolAdapter.sol";


/**
 * @dev MarchandDeGlace contract interface.
 * Only the functions required for GelatoAdapter contract are added.
 */
interface MarchandDeGlace {
    function gelLockedByWhale(address) external view returns (uint256);
}


/**
 * @title Adapter for Gelato locked GEL tokens locked on MarchandDeGlace contract.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract GelatoAdapter is ProtocolAdapter {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    address internal constant MARCHAND_DE_GLACE = 0x5898D2aE0745c8d09762Bac50fd9F34A2a95A563;
    address internal constant GEL = 0x15b7c0c907e4C6b9AdaAaabC300C08991D6CEA05;

    /**
     * @return Amount of GEL locked on the MarchandDeGlace contract by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        if (token != GEL) return 0;

        return MarchandDeGlace(MARCHAND_DE_GLACE).gelLockedByWhale(account);
    }
}
