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

import { ERC20 } from "../../interfaces/ERC20.sol";
import { OneSplit } from "../../interfaces/OneSplit.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";

/**
 * @title Interactive adapter for OneSplit exchange.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract OneSplitInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant ONE_SPLIT = 0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E;

    /**
     * @notice Exchanges tokens using OneSplit contract.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * "from" token address, "from" token amount to be deposited, and amount type.
     * @param data Bytes array with ABI-encoded `toToken` address.
     * @return tokensToBeWithdrawn Array with one element - `toToken` address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "OSIA: should be 1 tokenAmount");

        address fromToken = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        if (fromToken == ETH) {
            fromToken = address(0);
        } else {
            ERC20(fromToken).safeApprove(ONE_SPLIT, amount, "OSIA");
        }

        address toToken = abi.decode(data, (address));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = toToken;

        if (toToken == ETH) {
            toToken = address(0);
        }

        swap(fromToken, toToken, amount);
    }

    /**
     * @notice Withdraw functionality is not supported.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata, bytes calldata)
        external
        payable
        override
        returns (address[] memory)
    {
        revert("OSIA: no withdraw");
    }

    function swap(
        address fromToken,
        address toToken,
        uint256 amount
    ) internal {
        uint256[] memory distribution;

        try
            OneSplit(ONE_SPLIT).getExpectedReturn(
                fromToken,
                toToken,
                amount,
                uint256(1),
                uint256(0x040df0) // 0x040dfc to enable curve; 0x04fdf0 to enable base exchanges;
            )
        returns (uint256, uint256[] memory result) {
            distribution = result;
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("OSIA: 1split fail[1]");
        }

        uint256 ethAmount = fromToken == address(0) ? amount : 0;
        try
            OneSplit(ONE_SPLIT).swap{ value: ethAmount }(
                fromToken,
                toToken,
                amount,
                uint256(1),
                distribution,
                uint256(0x040df0) // 0x040dfc to enable curve; 0x04fdf0 to enable base exchanges;
            )
        {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("OSIA: 1split fail[2]");
        }
    }
}
