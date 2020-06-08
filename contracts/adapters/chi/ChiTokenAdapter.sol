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
 * @dev OneSplit contract interface.
 * Only the functions required for OneSplit contract are added.
 * The OneSplit contract is available here
 * github.com/CryptoManiacsZone/1inchProtocol/blob/master/contracts/OneSplit.sol.
 */
interface IOneSplit {

    function getExpectedReturn(
        ERC20 fromToken,
        ERC20 toToken,
        uint256 amount,
        uint256 parts,
        uint256 disableFlags
    )
    external
    view
    returns(
        uint256 returnAmount,
        uint256[] memory distribution
    );
}


/**
 * @title Token adapter for Chi Gastoken by 1inch.
 * @dev Implementation of Chi Token interface.
 */
contract OneInchChiTokenAdapter is TokenAdapter {

    ERC20 private constant ETH_ADDRESS = ERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    IOneSplit private constant oneSplit = IOneSplit(0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E);

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
        (uint256 rate, ) = oneSplit.getExpectedReturn(
            ERC20(token),
            ERC20(ETH_ADDRESS),
            1,
            1,
            0
        );

        Component[] memory underlyingTokens = new Component[](1);

        underlyingTokens[0] = Component({
            token: ETH_ADDRESS,
            tokenType: "ERC20",
            rate: rate
        });

        return underlyingTokens;
    }
}
