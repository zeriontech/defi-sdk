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
 * @dev YearnRewards contract interface.
 * Only the functions required for YFITokenAdapter contract are added.
 * The YearnRewards contract is available here
 * 0xcc9EFea3ac5Df6AD6A656235Ef955fBfEF65B862
 */
interface YearnRewards {
    function claimable(address _claimer) public view returns (uint);
}


/**
 * @title Token adapter for YFITokens.
 * @dev Implementation of TokenAdapter interface.
 * @author Connor Martin <cnr.mrtn@gmail.com>
 */
contract YFITokenAdapter is TokenAdapter {


    address internal constant ADAI = "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d";
    address internal constant YFI = "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e";

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
        Component[] memory underlyingTokens = new Component[](1);

        underlyingTokens[0] = Component({
            token: ADAI,
            tokenType: "ERC20",
            rate: YearnRewards(token).claimable()
        });

        return underlyingTokens;
    }
}
