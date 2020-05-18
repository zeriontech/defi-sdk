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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { OneSplitAdapter } from "../../adapters/1split/OneSplitAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev OneSplit contract interface.
 * Only the functions required for OneSplitInteractiveAdapter contract are added.
 * The OneSplit contract is available here
 * github.com/CryptoManiacsZone/1split/blob/master/contracts/OneSplit.sol.
 */
interface OneSplit {
    function swap(
        address,
        address,
        uint256,
        uint256,
        uint256[] calldata,
        uint256
    )
        external
        payable;
    function getExpectedReturn(
        address,
        address,
        uint256,
        uint256,
        uint256
    )
        external
        view
        returns (uint256, uint256[] memory);
}


/**
 * @title Interactive adapter for OneSplit exchange.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract OneSplitInteractiveAdapter is InteractiveAdapter, OneSplitAdapter {

    using SafeERC20 for ERC20;

    address internal constant ONE_SPLIT = 0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E;

    /**
     * @notice Exchanges tokens using OneSplit contract.
     * @param tokens Array with one element - `fromToken` address.
     * @param amounts Array with one element - token amount to be exchanged.
     * @param amountTypes Array with one element - amount type.
     * @param data Bytes array with ABI-encoded `toToken` address.
     * @return tokensToBeWithdrawn Array with one element - `toToken` address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "OSIA: should be 1 token!");
        require(tokens.length == amounts.length, "OSIA: inconsistent arrays!");

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        address fromToken = tokens[0];
        if (fromToken == ETH) {
            fromToken = address(0);
        } else {
            ERC20(fromToken).safeApprove(ONE_SPLIT, amount, "OSIA!");
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
    function withdraw(
        address[] memory,
        uint256[] memory,
        AmountType[] memory,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory)
    {
        revert("OSIA: no withdraw!");
    }

    function swap(address fromToken, address toToken, uint256 amount) internal {
        uint256[] memory distribution;

        try OneSplit(ONE_SPLIT).getExpectedReturn(
            fromToken,
            toToken,
            amount,
            uint256(1),
            uint256(0x040df0) // 0x040dfc to enable curve; 0x04fdf0 to enable base exchanges;
        ) returns (uint256, uint256[] memory result) {
            distribution = result;
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("OSIA: 1split fail![1]");
        }

        uint256 ethAmount = fromToken == address(0) ? amount : 0;
        try OneSplit(ONE_SPLIT).swap{value: ethAmount}(
            fromToken,
            toToken,
            amount,
            uint256(1),
            distribution,
            uint256(0x040df0) // 0x040dfc to enable curve; 0x04fdf0 to enable base exchanges;
        ) {} catch Error(string memory reason) { //solhint-disable-line no-empty-blocks
            revert(reason);
        } catch (bytes memory) {
            revert("OSIA: 1split fail![2]");
        }
    }
}
