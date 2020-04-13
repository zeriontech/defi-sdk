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

pragma solidity 0.6.6;
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
        ERC20,
        ERC20,
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
 * @dev Implementation of ProtocolAdapter interface.
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
     * @return Asset sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] calldata tokens,
        uint256[] calldata amounts,
        AmountType[] calldata amountTypes,
        bytes calldata data
    )
        external
        payable
        override
        returns (address[] memory)
    {
        require(tokens.length == 1, "OSIA: should be 1 token!");
        require(amounts.length == 1, "OSIA: should be 1 amount!");
        require(amountTypes.length == 1, "OSIA: should be 1 type!");

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        address toToken = abi.decode(data, (address));

        address[] memory tokensToBeWithdrawn;

        if (toToken == ETH) {
            tokensToBeWithdrawn = new address[](0);
            toToken = address(0);
        } else {
            tokensToBeWithdrawn = new address[](1);
            tokensToBeWithdrawn[0] = toToken;
        }

        if (tokens[0] == ETH) {
            getReturnAndSwap(address(0), toToken, 0, amount);
        } else {
            ERC20(tokens[0]).safeApprove(ONE_SPLIT, amount);
            getReturnAndSwap(tokens[0], toToken, amount, 0);
            ERC20(tokens[0]).safeApprove(ONE_SPLIT, 0);
        }

        return tokensToBeWithdrawn;
    }

    /**
     * @notice This function is unavailable in Exchange type adapters.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] calldata,
        uint256[] calldata,
        AmountType[] calldata,
        bytes calldata
    )
        external
        payable
        override
        returns (address[] memory)
    {
        revert("OSIA: no withdraw!");
    }

    function getReturnAndSwap(
        address fromToken,
        address toToken,
        uint256 tokenAmount,
        uint256 ethAmount
    )
        internal
    {
        OneSplit oneSplit = OneSplit(ONE_SPLIT);
        uint256 amount = ethAmount > 0 ? ethAmount : tokenAmount;
        uint256 returnAmount;
        uint256[] memory distribution;
        require(amount == ethAmount);
        oneSplit.getExpectedReturn(
            ERC20(fromToken),
            ERC20(toToken),
            amount,
            uint256(1),
            0
        );
        oneSplit.swap.value(ethAmount)(
            fromToken,
            toToken,
            amount,
            uint256(1),
            distribution,
            0
        );
    }
}
