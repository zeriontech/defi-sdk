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

import { ERC20 } from "../../shared/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";

/**
 * @dev Staking contract interface.
 * Only the functions required for AkroStakingAdapter contract are added.
 */
interface AkroStaking {
    function stake(uint256 amout, bytes calldata _data) external;

    function stakeFor(
        address _user,
        uint256 _amount,
        bytes memory _data
    ) external;

    function unstakeAllUnlocked(bytes calldata _data) external returns (uint256);
}

/**
 * @title Interactive Adapter for Akropolis Staking protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Alexander Mazaletskiy <am@akropolis.io>
 */

/**
 * @title Interactive adapter for Compound protocol.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract AkroStakingInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant STAKING = 0x3501Ec11d205fa249f2C42f5470e137b529b35D0;

    address internal constant AKRO = 0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7;

    /**
     * @notice Stake ADEL token to the ADEL Staking
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * ADEL token address, token amount to be stake, and amount type.
     * @return tokensToBeWithdrawn empty array
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(
            tokenAmounts.length == 1 && tokenAmounts[0].token == AKRO,
            "ADELIA: should be 1 tokenAmount[1]"
        );

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);

        ERC20(token).safeApprove(STAKING, amount, "AKROIA");

        //get user data from calldata
        address userAddress = abi.decode(data, (address));

        // solhint-disable-next-line no-empty-blocks
        try AkroStaking(STAKING).stakeFor(userAddress, amount, "0x")  {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("AKROIA: stake fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Adel Staking. it always withdraws all the tokens
     * @param tokenAmounts should be empty
     * @param data token address encoded in bytes data
     * @return tokensToBeWithdrawn Array with one element - AKRO token.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(
            tokenAmounts.length == 0 && abi.decode(data, (address)) == AKRO,
            "ADELIA: should be 0 tokenAmount"
        );

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = abi.decode(data, (address));

        // solhint-disable-next-line no-empty-blocks
        try AkroStaking(STAKING).unstakeAllUnlocked("0x")  {} catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("AKROIA: unstake fail");
        }
    }
}
