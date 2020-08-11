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

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


struct Exchange {
    address exchange;
    address adapter;
    bool takesCustody;
}


struct OpenMakeOrder {
    uint256 id; // Order Id from exchange
    uint256 expiresAt; // Timestamp when the order expires
    uint256 orderIndex; // Index of the order in the orders array
    address buyAsset; // Address of the buy asset in the order
    address feeAsset;
}


/**
 * @dev Spoke contract interface.
 * Only the functions required for MelonTokenAdapter contract are added.
 * The Spoke contract is available here
 * github.com/melonproject/protocol/blob/master/src/fund/hub/Spoke.sol.
 */
interface Spoke {
    function hub() external view returns (address);
}


/**
 * @dev Hub contract interface.
 * Only the functions required for MelonTokenAdapter contract are added.
 * The Hub contract is available here
 * github.com/melonproject/protocol/blob/master/src/fund/hub/Hub.sol.
 */
interface Hub {
    function accounting() external view returns (address);
    function vault() external view returns (address);
    function trading() external view returns (address);
}


/**
 * @dev Accounting contract interface.
 * Only the functions required for MelonTokenAdapter contract are added.
 * The Accounting contract is available here
 * github.com/melonproject/protocol/blob/master/src/fund/accounting/Accounting.sol.
 */
interface Accounting {
    function getOwnedAssets() external view returns (address[] memory);
}


/**
 * @dev Trading contract interface.
 * Only the functions required for MelonTokenAdapter contract are added.
 * The Trading contract is available here
 * github.com/melonproject/protocol/blob/master/src/fund/trading/Trading.sol.
 */
interface Trading {
    function exchanges(uint256) external view returns (Exchange memory);
    function exchangesToOpenMakeOrders(
        address,
        address
    )
        external
        view
        returns (OpenMakeOrder memory);
}


/**
 * @dev ExchangeAdapter contract interface.
 * Only the functions required for MelonTokenAdapter contract are added.
 * The ExchangeAdapter contract is available here
 * github.com/melonproject/protocol/blob/master/src/exchanges/ExchangeAdapter.sol.
 */
interface ExchangeAdapter {
    function getOrder(
        address,
        uint,
        address
    )
        external
        view
        returns (
            address,
            address,
            uint
        );
}


/**
 * @title Token adapter for Melon Protocol by @codingsh.
 * @dev Implementation of TokenAdapter interface.
 * @author codingsh <codingsh@pm.me>
 */
contract MelonTokenAdapter is TokenAdapter {

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: ERC20(token).name(),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        uint256 totalSupply = ERC20(token).totalSupply();
        address hub = Spoke(token).hub();
        address accounting = Hub(hub).accounting();
        address vault = Hub(hub).vault();
        address trading = Hub(hub).trading();
        address[] memory ownedAssets = Accounting(accounting).getOwnedAssets();
        uint256 orderId;
        uint256 totalQuantity;
        uint256 remainingSellQuantity;

        bool result = true;
        uint256 counter = 0;

        while (result) {
            (result, ) = trading.staticcall(abi.encodeWithSelector(Trading(trading).exchanges.selector, counter));
            counter++;
        }

        Exchange[] memory exchanges = new Exchange[](counter - 1);

        for (uint256 i = 0; i < exchanges.length; i++) {
            exchanges[i] = Trading(trading).exchanges(i);
        }

        Component[] memory underlyingTokens = new Component[](ownedAssets.length);

        for (uint256 i = 0; i < ownedAssets.length; i++) {
            totalQuantity = ERC20(ownedAssets[i]).balanceOf(vault);
            totalQuantity += ERC20(ownedAssets[i]).balanceOf(trading);

            for (uint256 j = 0; j < exchanges.length; j++) {
                orderId = Trading(trading).exchangesToOpenMakeOrders(
                    exchanges[j].exchange,
                    ownedAssets[i]
                ).id;
                if (orderId == 0) {
                    continue;
                }
                (, , remainingSellQuantity) = ExchangeAdapter(exchanges[j].adapter).getOrder(
                    exchanges[j].exchange,
                    orderId,
                    ownedAssets[i]
                );
                if (exchanges[j].takesCustody) {
                    totalQuantity += remainingSellQuantity;
                }
            }

            underlyingTokens[i] = Component({
                token: ownedAssets[i],
                tokenType: "ERC20",
                rate: totalQuantity * 1e18 / totalSupply
            });
        }

        return underlyingTokens;
    }
}
