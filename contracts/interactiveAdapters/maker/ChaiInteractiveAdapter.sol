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
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";

/**
 * @dev Chai contract interface.
 * Only the functions required for ChaiAdapter contract are added.
 * The Chai contract is available here
 * github.com/dapphub/chai/blob/master/src/chai.sol.
 */
interface Chai {
    function join(address, uint256) external;

    function exit(address, uint256) external;
}

/**
 * @title Interactive adapter for Chai contract.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract ChaiInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address internal constant CHAI = 0x06AF07097C9Eeb7fD685c692751D5C66dB49c215;

    /**
     * @notice Deposits tokens to the Chai contract.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * DAI token address, DAI token amount to be deposited, and amount type.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "CIA: should be 1 tokenAmount[1]");
        require(tokenAmounts[0].token == CHAI, "CIA: should be DAI");

        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);
        ERC20(DAI).safeApprove(CHAI, amount, "CIA");

        try Chai(CHAI).join(address(this), amount) {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("CIA: deposit fail");
        }

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = CHAI;
    }

    /**
     * @notice Withdraws tokens from the Chai contract.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * CHAI token address, CHAI token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with one element - DAI address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "CIA: should be 1 tokenAmount[2]");
        require(tokenAmounts[0].token == CHAI, "CIA: should be CHAI");

        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        try Chai(CHAI).exit(address(this), amount) {} catch Error(string memory reason) {
            //solhint-disable-previous-line no-empty-blocks
            revert(reason);
        } catch {
            revert("CIA: deposit fail");
        }

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = DAI;
    }
}
