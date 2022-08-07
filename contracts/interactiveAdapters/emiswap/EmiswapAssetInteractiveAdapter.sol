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

pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { SafeERC20 } from "../../shared/SafeERC20.sol";
import { TokenAmount } from "../../shared/Structs.sol";
import { ERC20ProtocolAdapter } from "../../adapters/ERC20ProtocolAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";
import "../../interfaces/IEmiswap.sol";

/**
 * @title Interactive adapter for Emiswap protocol (liquidity).
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract EmiswapV2AssetInteractiveAdapter is InteractiveAdapter, ERC20ProtocolAdapter {
    using SafeERC20 for ERC20;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Deposits tokens to the Uniswap pool (pair).
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * underlying tokens addresses, underlying tokens amounts to be deposited, and amount types.
     * @param data ABI-encoded additional parameters:
     *     - pair - pair address.
     * @return tokensToBeWithdrawn Array with one element - UNI-token (pair) address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 2, "ELIA: should be 2 tokenAmounts");

        address pair = abi.decode(data, (address));

        uint256 [] memory a = new uint256[](2);
        uint256 [] memory minA = new uint256[](2);

        a[0] = getAbsoluteAmountDeposit(tokenAmounts[0]);
        a[1] = getAbsoluteAmountDeposit(tokenAmounts[1]);
                                           
        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = tokenAmounts[0].token;
        tokensToBeWithdrawn[1] = tokenAmounts[1].token;

        // solhint-disable-next-line no-empty-blocks

        try IEmiswap(pair).deposit(a, minA, address(0)) returns (uint256) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("ELIA: deposit fail");
        }
    }

    /**
     * @notice Withdraws tokens from the Uniswap pool.
     * @param tokenAmounts Array with one element - TokenAmount struct with
     * UNI token address, UNI token amount to be redeemed, and amount type.
     * @return tokensToBeWithdrawn Array with two elements - underlying tokens.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(TokenAmount[] calldata tokenAmounts, bytes calldata)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokenAmounts.length == 1, "ELIA: should be 1 tokenAmount");

        address token = tokenAmounts[0].token;
        uint256 amount = getAbsoluteAmountWithdraw(tokenAmounts[0]);

        tokensToBeWithdrawn = new address[](2);
        tokensToBeWithdrawn[0] = address(IEmiswap(token).tokens(0));
        tokensToBeWithdrawn[1] = address(IEmiswap(token).tokens(1));

        // solhint-disable-next-line no-empty-blocks
        uint256 [] memory minReturns = new uint256[](2);

        try IEmiswap(token).withdraw(amount, minReturns) {} catch Error(
            string memory reason
        ) {
            revert(reason);
        } catch {
            revert("ELIA: withdraw fail");
        }
    }
}
