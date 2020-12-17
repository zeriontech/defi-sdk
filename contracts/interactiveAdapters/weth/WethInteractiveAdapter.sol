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
//
// SPDX-License-Identifier: LGPL-3.0-only

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import { WETH9 } from "../../interfaces/WETH9.sol";

/**
 * @title Interactive adapter for Wrapped Ether.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract WethInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Wraps Ether in Wrapped Ether.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * ETH address (0xEeee...EEeE), ETH amount to be deposited, and amount type.
     * @return tokensToBeWithdrawn Array with one element - WETH token address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "WIA: should be 1 tokenAmount");
        require(tokenAmounts[0].token == ETH, "WIA: should be ETH");

        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = WETH;

        // solhint-disable-next-line no-empty-blocks
        try WETH9(WETH).deposit{ value: amount }() {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("WIA: deposit fail");
        }
    }

    /**
     * @notice Unwraps Ether from Wrapped Ether.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * WETH token address, WETH token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with one element - ETH address (0xEeee...EEeE).
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "WIA: should be 1 tokenAmount");
        require(tokenAmounts[0].token == WETH, "WIA: should be WETH");

        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = ETH;

        // solhint-disable-next-line no-empty-blocks
        try WETH9(WETH).withdraw(amount) {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("WIA: withdraw fail");
        }
    }
}
