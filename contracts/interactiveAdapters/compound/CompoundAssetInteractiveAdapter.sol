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
import { CompoundAssetAdapter } from "../../adapters/compound/CompoundAssetAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev CEther contract interface.
 * Only the functions required for CompoundAssetInteractiveAdapter contract are added.
 * The CEther contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CEther.sol.
 */
interface CEther {
    function mint() external payable;
}


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundAssetInteractiveAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function mint(uint256) external returns (uint256);
    function redeem(uint256) external returns (uint256);
    function underlying() external view returns (address);
}

/**
 * @dev CompoundRegistry contract interface.
 * Only the functions required for CompoundAssetInteractiveAdapter contract are added.
 * The CompoundRegistry contract is available in this repository.
 */
interface CompoundRegistry {
    function getCToken(address) external view returns (address);
}


/**
 * @title Interactive adapter for Compound protocol.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract CompoundAssetInteractiveAdapter is InteractiveAdapter, CompoundAssetAdapter {

    using SafeERC20 for ERC20;

    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant REGISTRY = 0xE6881a7d699d3A350Ce5bba0dbD59a9C36778Cb7;

    /**
     * @notice Deposits tokens to the Compound protocol.
     * @param tokens Array with one element - underlying token address.
     * @param amounts Array with one element - underlying token amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with one element - cToken address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "CAIA: should be 1 token![1]");
        require(tokens.length == amounts.length, "CAIA: inconsistent arrays![2]");

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);

        if (tokens[0] == CETH) {
            CEther(CETH).mint{value: amount}();

            tokensToBeWithdrawn[0] = CETH;
        } else {
            address cToken = CompoundRegistry(REGISTRY).getCToken(tokens[0]);

            ERC20(tokens[0]).safeApprove(cToken, amount, "CAIA!");
            require(CToken(cToken).mint(amount) == 0, "CAIA: deposit failed!");

            tokensToBeWithdrawn[0] = cToken;
        }
    }

    /**
     * @notice Withdraws tokens from the Compound protocol.
     * @param tokens Array with one element - cToken address.
     * @param amounts Array with one element - cToken amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with one element - underlying token (empty in ETH case).
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "CAIA: should be 1 token![1]");
        require(tokens.length == amounts.length, "CAIA: inconsistent arrays![2]");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        CToken cToken = CToken(tokens[0]);

        require(cToken.redeem(amount) == 0, "CAIA: withdraw failed!");

        if (tokens[0] == CETH) {
            tokensToBeWithdrawn = new address[](1);
            tokensToBeWithdrawn[0] = ETH;
        } else {
            tokensToBeWithdrawn = new address[](1);
            tokensToBeWithdrawn[0] = cToken.underlying();
        }
    }
}
