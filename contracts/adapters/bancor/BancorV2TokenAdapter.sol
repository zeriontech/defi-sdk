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


interface Ownable {
    function owner() external view returns (address);
}


/**
 * @dev LiquidityPoolV2Converter contract interface.
 * Only the functions required for BancorV2TokenAdapter contract are added.
 * The LiquidityPoolV2Converter interface is available here
 * github.com/bancorprotocol/contracts-solidity/blob/master/solidity/contracts/converter/interfaces/IConverter.sol.
 */
interface LiquidityPoolV2Converter {
    function connectorTokenCount() external view returns (uint256);
    function connectorTokens(uint256) external view returns (address);
    function poolToken(address) external view returns (address);
    function removeLiquidityReturnAndFee(address, uint256) external view returns (uint256);
}


/**
 * @title Token adapter for SmartTokens V2.
 * @dev Implementation of TokenAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BancorV2TokenAdapter is TokenAdapter {

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
        address poolTokensContainer = Ownable(token).owner();
        address converter = Ownable(poolTokensContainer).owner();
        uint256 connectorTokenCount = LiquidityPoolV2Converter(converter).connectorTokenCount();

        Component[] memory underlyingTokens = new Component[](1);

        address underlyingToken;
        for (uint256 i = 0; i < connectorTokenCount; i++) {
            underlyingToken = LiquidityPoolV2Converter(converter).connectorTokens(i);

            if (LiquidityPoolV2Converter(converter).poolToken(underlyingToken) == token) {
                underlyingTokens[0] = Component({
                    token: underlyingToken,
                    tokenType: "ERC20",
                    rate: LiquidityPoolV2Converter(converter).removeLiquidityReturnAndFee(
                        token,
                        1e18
                    )
                });
            }
        }

        return underlyingTokens;
    }
}
