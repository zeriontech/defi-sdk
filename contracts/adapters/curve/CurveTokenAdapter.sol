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
import { TokenMetadata, Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveTokenAdapter contract are added.
 * The stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
// solhint-disable-next-line contract-name-camelcase
interface stableswap {
    function coins(int128) external view returns (address);
    function balances(int128) external view returns (uint256);
}


/**
 * @title Token adapter for Curve pool tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveTokenAdapter is TokenAdapter("Curve pool token") {

    address internal constant C_POOL_TOKEN = 0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2;
    address internal constant T_POOL_TOKEN = 0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23;
    address internal constant Y_POOL_TOKEN = 0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8;
    address internal constant B_POOL_TOKEN = 0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B;
    address internal constant S_POOL_TOKEN = 0xC25a3A3b969415c80451098fa907EC722572917F;
    address internal constant P_POOL_TOKEN = 0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8;
    address internal constant CDAI = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;
    address internal constant CUSDC = 0x39AA39c021dfbaE8faC545936693aC917d5E7563;
    address internal constant YDAI = 0xC2cB1040220768554cf699b0d863A3cd4324ce32;
    address internal constant YUSDC = 0x26EA744E5B887E5205727f55dFBE8685e3b21951;
    address internal constant YUSDT = 0xE6354ed5bC4b393a5Aad09f21c46E101e692d447;
    address internal constant YTUSD = 0x73a052500105205d34Daf004eAb301916DA8190f;
    address internal constant YBUSD = 0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE;
    address internal constant YCDAI = 0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc;
    address internal constant YCUSDC = 0x9777d7E2b60bB01759D0E2f8be2095df444cb07E;
    address internal constant YCUSDT = 0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        (stableswap ss, uint256 length) = getPoolInfo(token);
        Component[] memory underlyingComponents= new Component[](length);

        address underlyingToken;
        for (uint256 i = 0; i < length; i++) {
            underlyingToken = ss.coins(int128(i));
            underlyingComponents[i] = Component({
                token: underlyingToken,
                tokenType: getTokenType(underlyingToken),
                rate: ss.balances(int128(i)) * 1e18 / ERC20(token).totalSupply()
            });
        }

        return underlyingComponents;
    }

    /**
     * @return Pool name.
     */
    function getName(address token) internal view override returns (string memory) {
        return string(abi.encodePacked(ERC20(token).symbol(), " pool"));
    }

    /**
     * @return Stableswap address, number of coins, type of tokens inside.
     */
    function getPoolInfo(address token) internal pure returns (stableswap, uint256) {
        if (token == C_POOL_TOKEN) {
            return (stableswap(0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56), 2);
        } else if (token == T_POOL_TOKEN) {
            return (stableswap(0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C), 3);
        } else if (token == Y_POOL_TOKEN) {
            return (stableswap(0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51), 4);
        } else if (token == B_POOL_TOKEN) {
            return (stableswap(0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27), 4);
        } else if (token == S_POOL_TOKEN) {
            return (stableswap(0xA5407eAE9Ba41422680e2e00537571bcC53efBfD), 4);
        } else if (token == P_POOL_TOKEN) {
            return (stableswap(0x06364f10B501e868329afBc005b3492902d6C763), 4);
        } else {
            return (stableswap(address(0)), 0);
        }
    }

    function getTokenType(address token) internal pure returns (bytes32) {
        if (token == CDAI || token == CUSDC) {
            return "CToken";
        } else if (
            token == YDAI ||
            token == YUSDC ||
            token == YUSDT ||
            token == YTUSD ||
            token == YBUSD ||
            token == YCDAI ||
            token == YCUSDC ||
            token == YCUSDT
        ) {
            return "YToken";
        } else {
            return "ERC20";
        }

    }
}
