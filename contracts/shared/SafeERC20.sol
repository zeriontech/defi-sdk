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

pragma solidity 0.8.1;

import { ERC20 } from "../interfaces/ERC20.sol";
import { Base } from "./Base.sol";
import { Helpers } from "./Helpers.sol";

/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token contract
 * returns false). Tokens that return no value (and instead revert or throw on failure)
 * are also supported, non-reverting calls are assumed to be successful.
 */
library SafeERC20 {
    function safeTransfer(
        address token,
        address to,
        uint256 value,
        string memory location
    ) internal {
        callOptionalReturn(token, ERC20(token).transfer.selector, abi.encode(to, value), location);
    }

    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value,
        string memory location
    ) internal {
        callOptionalReturn(
            token,
            ERC20(token).transferFrom.selector,
            abi.encode(from, to, value),
            location
        );
    }

    function safeApprove(
        address token,
        address spender,
        uint256 value,
        string memory location
    ) internal {
        require(
            (value == type(uint256).max) ||
                (value == 0) ||
                (ERC20(token).allowance(address(this), spender) == 0),
            string(abi.encodePacked(location, " : safeApprove failed"))
        );
        callOptionalReturn(
            token,
            ERC20(token).approve.selector,
            abi.encode(spender, value),
            location
        );
    }

    function safeApproveMax(
        address token,
        address spender,
        uint256 value,
        string memory location
    ) internal {
        uint256 allowance = ERC20(token).allowance(address(this), spender);
        if (allowance < value) {
            safeApprove(token, spender, type(uint256).max, location);
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract),
     * relaxing the requirement on the return value: the return value is optional
     * (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param selector Function selector for the call.
     * @param callData The call data (encoded using abi.encode or one of its variants).
     * @param location Location of the call (for debug).
     */
    function callOptionalReturn(
        address token,
        bytes4 selector,
        bytes memory callData,
        string memory location
    ) private {
        bytes memory returnData = Base.externalCall(token, selector, callData, 0, location);

        if (returnData.length > 0) {
            // Return data is optional
            require(
                abi.decode(returnData, (bool)),
                string(
                    abi.encodePacked(location, ": ", Helpers.toString(selector), " returned false")
                )
            );
        }
    }
}
