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
import { ChaiAdapter } from "../../adapters/maker/ChaiAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev Chai contract interface.
 * Only the functions required for ChaiAdapter contract are added.
 * The Chai contract is available here
 * github.com/dapphub/chai/blob/master/src/chai.sol.
 */
interface Chai {
    function join(address, uint) external;
    function exit(address, uint) external;
}


/**
 * @title Interactive adapter for Chai contract.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract ChaiInteractiveAdapter is InteractiveAdapter, ChaiAdapter {

    using SafeERC20 for ERC20;

    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address internal constant CHAI = 0x06AF07097C9Eeb7fD685c692751D5C66dB49c215;

    /**
     * @notice Deposits tokens to the Chai contract.
     * @param amounts Array with one element - DAI amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with one element - CHAI address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(amounts.length == 1, "CIA: should be 1 amount/type![1]");

        uint256 amount = getAbsoluteAmountDeposit(DAI, amounts[0], amountTypes[0]);
        ERC20(DAI).safeApprove(CHAI, amount, "CIA!");

        try Chai(CHAI).join(address(this), amount) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("CIA: deposit fail!");
        }

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = CHAI;
    }

    /**
     * @notice Withdraws tokens from the Chai contract.
     * @param amounts Array with one element - CHAI amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with one element - DAI address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] memory,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(amounts.length == 1, "CIA: should be 1 amount/type![2]");

        uint256 amount = getAbsoluteAmountWithdraw(CHAI, amounts[0], amountTypes[0]);
        try Chai(CHAI).exit(address(this), amount) { // solhint-disable-line no-empty-blocks
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("CIA: deposit fail!");
        }

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = DAI;
    }
}
