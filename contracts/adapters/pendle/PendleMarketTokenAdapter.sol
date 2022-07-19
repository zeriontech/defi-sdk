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
 * @dev PendleMarket contract interface.
 * Only the functions required for PendleTokenAdapter contract are added.
 * The PendleMarket contract is available here
 * github.com/pendle-finance/pendle-core/blob/master/contracts/interfaces/IPendleMarket.sol.
 */
interface PendleMarket {
    function xyt() external view returns (address);
    function token() external view returns (address);
    function getReserves()
        external
        view
        returns (
            uint256 xytBalance,
            uint256 xytWeight,
            uint256 tokenBalance,
            uint256 tokenWeight,
            uint256 currentBlock
        );
}

/**
 * @title Token adapter for PendleMarket Tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Anton Buenavista <anton@pendle.finance>
 */
contract PendleMarketTokenAdapter is TokenAdapter {

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token) external view override returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: getMarketName(token),
            symbol: ERC20(token).symbol(),
            decimals: ERC20(token).decimals()
        });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address market) external view override returns (Component[] memory) {
        address token = PendleMarket(market).token();
        address xyt = PendleMarket(market).xyt();
        uint256 totalSupply = ERC20(market).totalSupply();
        (uint256 xytBalance, ,uint256 tokenBalance, , ) = PendleMarket(market).getReserves();

        Component[] memory components = new Component[](2);

        components[0] = Component({
            token: xyt,
            tokenType: "ERC20",
            rate: totalSupply == 0 ? 0 : xytBalance * 1e18 / totalSupply
        });
        components[1] = Component({
            token: token,
            tokenType: "ERC20",
            rate: totalSupply == 0 ? 0 : tokenBalance * 1e18 / totalSupply
        });

        return components;
    }

    function getMarketName(address market) internal view returns (string memory) {
        return string(
            abi.encodePacked(
                getSymbol(PendleMarket(market).xyt()),
                "/",
                getSymbol(PendleMarket(market).token()),
                " Market"
            )
        );
    }

    function getSymbol(address token) internal view returns (string memory) {
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).symbol.selector)
        );

        if (returnData.length == 32) {
            return convertToString(abi.decode(returnData, (bytes32)));
        } else {
            return abi.decode(returnData, (string));
        }
    }

    /**
     * @dev Internal function to convert bytes32 to string and trim zeroes.
     */
    function convertToString(bytes32 data) internal pure returns (string memory) {
        uint256 length = 0;
        bytes memory result;

        for (uint256 i = 0; i < 32; i++) {
            if (data[i] != byte(0)) {
                length++;
            }
        }

        result = new bytes(length);

        for (uint256 i = 0; i < length; i++) {
            result[i] = data[i];
        }

        return string(result);
    }
}
