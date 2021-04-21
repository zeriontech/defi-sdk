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

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { AdapterManager } from "./AdapterManager.sol";
import { TokenAdapterNamesManager } from "./TokenAdapterNamesManager.sol";
import { ITokenAdapter } from "../interfaces/ITokenAdapter.sol";
import { ITokenAdapterRegistry } from "../interfaces/ITokenAdapterRegistry.sol";
import { Base } from "../shared/Base.sol";
import { Ownable } from "../shared/Ownable.sol";
import {
    AdapterBalance,
    ERC20Metadata,
    FullTokenBalance,
    TokenBalance,
    TokenBalanceMeta
} from "../shared/Structs.sol";

/**
 * @title Registry for token adapters.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenAdapterRegistry is
    ITokenAdapterRegistry,
    Ownable,
    AdapterManager,
    TokenAdapterNamesManager
{
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice Fills in FullTokenBalance structs with underlying tokens.
     * @param tokenBalances Array of TokenBalance structs consisting of
     *     token addresses and absolute amounts.
     * @return fullTokenBalances Array of FullTokenBalance structs
     *     with 'closest' underlying tokens.
     */
    function getFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        override
        returns (FullTokenBalance[] memory fullTokenBalances)
    {
        uint256 length = tokenBalances.length;

        fullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            fullTokenBalances[i] = getFullTokenBalance(tokenBalances[i]);
        }

        return fullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with final underlying tokens.
     * @param tokenBalances Array of TokenBalance structs consisting of
     *     token addresses and absolute amounts.
     * @return finalFullTokenBalances Array of FullTokenBalance structs
     *     with 'deepest' underlying tokens.
     */
    function getFinalFullTokenBalances(TokenBalance[] calldata tokenBalances)
        external
        override
        returns (FullTokenBalance[] memory finalFullTokenBalances)
    {
        uint256 length = tokenBalances.length;

        finalFullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            finalFullTokenBalances[i] = getFinalFullTokenBalance(tokenBalances[i]);
        }

        return finalFullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with underlying tokens.
     * @dev Amount is considered to be 10 ** decimals.
     * Use this method carefully as decimals is an optional method in ERC20 standard.
     * @param tokens Array of token addresses.
     * @return fullTokenBalances Array of FullTokenBalance structs
     *     with 'closest' underlying tokens.
     */
    function getFullTokenBalances(address[] calldata tokens)
        external
        override
        returns (FullTokenBalance[] memory fullTokenBalances)
    {
        uint256 length = tokens.length;

        fullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            address token = tokens[i];

            fullTokenBalances[i] = getFullTokenBalance(
                TokenBalance({ token: token, amount: int256(10)**getDecimals(token) })
            );
        }

        return fullTokenBalances;
    }

    /**
     * @notice Fills in FullTokenBalance structs with final underlying tokens.
     * @dev Amount is considered to be 10 ** decimals.
     * Use this method carefully as decimals is an optional method in ERC20 standard.
     * @param tokens Array of token addresses.
     * @return finalFullTokenBalances Array of FullTokenBalance structs
     *     with 'deepest' underlying tokens.
     */
    function getFinalFullTokenBalances(address[] calldata tokens)
        external
        override
        returns (FullTokenBalance[] memory finalFullTokenBalances)
    {
        uint256 length = tokens.length;

        finalFullTokenBalances = new FullTokenBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            address token = tokens[i];

            finalFullTokenBalances[i] = getFinalFullTokenBalance(
                TokenBalance({ token: token, amount: int256(10)**getDecimals(token) })
            );
        }

        return finalFullTokenBalances;
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of token address and absolute amount.
     * @return Array of TokenBalance structs with 'closest' underlying token balances.
     */
    function getUnderlyingTokenBalances(TokenBalance memory tokenBalance)
        public
        returns (TokenBalance[] memory)
    {
        address tokenAdapter = getTokenAdapter(tokenBalance.token);

        if (tokenAdapter == address(0)) {
            return new TokenBalance[](0);
        }

        try ITokenAdapter(tokenAdapter).getUnderlyingTokenBalances(tokenBalance) returns (
            TokenBalance[] memory underlyingTokenBalances
        ) {
            return underlyingTokenBalances;
        } catch {
            return new TokenBalance[](0);
        }
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of token address and absolute amount.
     * @return finalUnderlyingTokenBalances Array of TokenBalance structs
     *     with 'deepest' underlying token balances.
     */
    function getFinalUnderlyingTokenBalances(TokenBalance memory tokenBalance)
        public
        returns (TokenBalance[] memory finalUnderlyingTokenBalances)
    {
        uint256 counter = 0;

        finalUnderlyingTokenBalances = new TokenBalance[](
            getFinalUnderlyingTokenBalancesNumber(tokenBalance, true)
        );

        TokenBalance[] memory underlyingTokenBalances = getUnderlyingTokenBalances(tokenBalance);
        uint256 underlyingTokenBalancesNumber = underlyingTokenBalances.length;

        TokenBalance[] memory tempUnderlyingTokenBalances;

        for (uint256 i = 0; i < underlyingTokenBalancesNumber; i++) {
            tempUnderlyingTokenBalances = getFinalUnderlyingTokenBalances(
                underlyingTokenBalances[i]
            );

            uint256 tempUnderlyingTokenBalancesNumber = tempUnderlyingTokenBalances.length;

            if (tempUnderlyingTokenBalancesNumber == 0) {
                finalUnderlyingTokenBalances[counter] = underlyingTokenBalances[i];
                counter = counter + 1;
            } else {
                for (uint256 j = 0; j < tempUnderlyingTokenBalancesNumber; j++) {
                    finalUnderlyingTokenBalances[counter + j] = tempUnderlyingTokenBalances[j];
                }

                counter = counter + tempUnderlyingTokenBalancesNumber;
            }
        }

        return finalUnderlyingTokenBalances;
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of token address and absolute amount.
     * @param underlyingTokenBalances TokenBalance structs array consisting of
     *     token address and absolute amount for each underlying token.
     * @return FullTokenBalance struct given token and underlying tokens balances.
     */
    function getFullTokenBalance(
        TokenBalance memory tokenBalance,
        TokenBalance[] memory underlyingTokenBalances
    ) public view returns (FullTokenBalance memory) {
        uint256 length = underlyingTokenBalances.length;
        TokenBalanceMeta[] memory underlyingTokenBalancesMeta = new TokenBalanceMeta[](length);

        for (uint256 i = 0; i < length; i++) {
            underlyingTokenBalancesMeta[i] = TokenBalanceMeta({
                tokenBalance: underlyingTokenBalances[i],
                erc20metadata: getERC20Metadata(underlyingTokenBalances[i])
            });
        }

        return
            FullTokenBalance({
                base: TokenBalanceMeta({
                    tokenBalance: tokenBalance,
                    erc20metadata: getERC20Metadata(tokenBalance)
                }),
                underlying: underlyingTokenBalancesMeta
            });
    }

    /**
     * @dev Gets token adapter address for the given token address.
     * @param token Address of the token.
     * @return Token adapter address.
     */
    function getTokenAdapter(address token) public view returns (address) {
        bytes32 tokenAdapterName = getTokenAdapterName(token);
        address tokenAdapter = getAdapterAddress(tokenAdapterName);

        return tokenAdapter;
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of token address and absolute amount.
     * @return FullTokenBalance struct with 'closest' underlying tokens.
     */
    function getFullTokenBalance(TokenBalance memory tokenBalance)
        internal
        returns (FullTokenBalance memory)
    {
        return getFullTokenBalance(tokenBalance, getUnderlyingTokenBalances(tokenBalance));
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of token address and absolute amount.
     * @return FullTokenBalance struct with 'deepest' underlying tokens.
     */
    function getFinalFullTokenBalance(TokenBalance memory tokenBalance)
        internal
        returns (FullTokenBalance memory)
    {
        return getFullTokenBalance(tokenBalance, getFinalUnderlyingTokenBalances(tokenBalance));
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of token address and absolute amount.
     * @param initial Whether the function call is initial or recursive.
     * @return finalUnderlyingTokenBalancesNumber Final underlying tokens number.
     */
    function getFinalUnderlyingTokenBalancesNumber(TokenBalance memory tokenBalance, bool initial)
        internal
        returns (uint256 finalUnderlyingTokenBalancesNumber)
    {
        finalUnderlyingTokenBalancesNumber = 0;
        TokenBalance[] memory underlyingTokenBalances = getUnderlyingTokenBalances(tokenBalance);

        if (underlyingTokenBalances.length == 0) {
            return initial ? uint256(0) : uint256(1);
        }

        for (uint256 i = 0; i < underlyingTokenBalances.length; i++) {
            finalUnderlyingTokenBalancesNumber =
                finalUnderlyingTokenBalancesNumber +
                getFinalUnderlyingTokenBalancesNumber(underlyingTokenBalances[i], false);
        }

        return finalUnderlyingTokenBalancesNumber;
    }

    /**
     * @param tokenBalance TokenBalance struct consisting of token address and absolute amount.
     * @return ERC20Metadata struct by TokenBalance struct.
     */
    function getERC20Metadata(TokenBalance memory tokenBalance)
        internal
        view
        returns (ERC20Metadata memory)
    {
        address tokenAdapter = getTokenAdapter(tokenBalance.token);

        if (tokenAdapter == address(0)) {
            return ERC20Metadata({ name: "Not available", symbol: "N/A", decimals: 0 });
        }

        try ITokenAdapter(tokenAdapter).getMetadata(tokenBalance) returns (
            ERC20Metadata memory metadata
        ) {
            return metadata;
        } catch {
            return ERC20Metadata({ name: "Not available", symbol: "N/A", decimals: 0 });
        }
    }

    /**
     * @dev Gets token's decimals if possible.
     * @param token Address of the token.
     * @return Token decimals.
     */
    function getDecimals(address token) internal view returns (uint8) {
        if (token == ETH) {
            return 18;
        }
        bytes memory returnData =
            Address.functionStaticCall(
                token,
                abi.encodePacked(ERC20.decimals.selector),
                "TAR: decimals"
            );

        if (returnData.length < 32) {
            return 0;
        }
        return abi.decode(returnData, (uint8));
    }
}
