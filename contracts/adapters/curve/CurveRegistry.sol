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

import { Ownable } from "../../Ownable.sol";


struct PoolInfo {
    address swap;       // stableswap contract address.
    uint256 totalCoins; // Number of coins used in stableswap contract.
    string name;        // Pool name ("... Pool").
}


/**
 * @title Registry for Curve contracts.
 * @dev Implements two getters - getSwapAndTotalCoins(address) and getName(address).
 * @notice Call getSwapAndTotalCoins(token) and getName(address) function and get address,
 * coins number, and name of stableswap contract for the given token address.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveRegistry is Ownable {

    mapping (address => PoolInfo) internal poolInfo;

    constructor() public {
        poolInfo[0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2] = PoolInfo({
            swap: 0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56,
            totalCoins: 2,
            name: "Compound Pool"
        });
        poolInfo[0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23] = PoolInfo({
            swap: 0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C,
            totalCoins: 3,
            name: "USDT Pool"
        });
        poolInfo[0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8] = PoolInfo({
            swap: 0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51,
            totalCoins: 4,
            name: "Y Pool"
        });
        poolInfo[0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B] = PoolInfo({
            swap: 0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27,
            totalCoins: 4,
            name: "bUSD Pool"
        });
        poolInfo[0xC25a3A3b969415c80451098fa907EC722572917F] = PoolInfo({
            swap: 0xA5407eAE9Ba41422680e2e00537571bcC53efBfD,
            totalCoins: 4,
            name: "sUSD Pool"
        });
        poolInfo[0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8] = PoolInfo({
            swap: 0x06364f10B501e868329afBc005b3492902d6C763,
            totalCoins: 4,
            name: "PAX Pool"
        });
        poolInfo[0x1f2a662FB513441f06b8dB91ebD9a1466462b275] = PoolInfo({
            swap: 0x9726e9314eF1b96E45f40056bEd61A088897313E,
            totalCoins: 3,
            name: "tBTC Pool"
        });
        poolInfo[0x7771F704490F9C0C3B06aFe8960dBB6c58CBC812] = PoolInfo({
            swap: 0x8474c1236F0Bc23830A23a41aBB81B2764bA9f4F,
            totalCoins: 2,
            name: "renBTC Pool"
        });
    }

    function setPoolInfo(
        address token,
        address swap,
        uint256 totalCoins,
        string calldata name
    )
        external
        onlyOwner
    {
        poolInfo[token] = PoolInfo({
            swap: swap,
            totalCoins: totalCoins,
            name: name
        });
    }

    function getSwapAndTotalCoins(address token) external view returns (address, uint256) {
        return (poolInfo[token].swap, poolInfo[token].totalCoins);
    }

    function getName(address token) external view returns (string memory) {
        return poolInfo[token].name;
    }
}
