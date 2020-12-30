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


/**
 * @dev OneInchLiquidityProtocol contract interface.
 * Only the functions required for OneInchLiquidityProtocolTokenAdapter contract are added.
 */
interface OneInchLiquidityProtocol {
    function getTokens() external view returns(address[] memory);
}


/**
 * @title Token adapter for OneInchLiquidityProtocol pool tokens.
 * @dev Implementation of TokenAdapter interface.
 * @author 1inch.exchange <info@1inch.exchange>
 */
contract OneInchLiquidityProtocolTokenAdapter is TokenAdapter {

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
        address[] memory tokens = OneInchLiquidityProtocol(token).getTokens();
        uint256 totalSupply = ERC20(token).totalSupply();
        Component[] memory underlyingTokens = new Component[](2);

        for (uint256 i = 0; i < 2; i++) {
            underlyingTokens[i] = Component({
                token: isETH(ERC20(tokens[i])) ? 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE : tokens[i],
                tokenType: "ERC20",
                rate: totalSupply == 0 ? 0 : uniBalanceOf(ERC20(tokens[i]), token) * 1e18 / totalSupply
            });
        }

        return underlyingTokens;
    }

    function uniBalanceOf(ERC20 token, address account) internal view returns (uint256) {
        if (isETH(token)) {
            return account.balance;
        } else {
            return token.balanceOf(account);
        }
    }

    function isETH(ERC20 token) internal pure returns(bool) {
        return (address(token) == address(0));
    }
}
