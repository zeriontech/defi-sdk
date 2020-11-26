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
import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { Ownable } from "../../Ownable.sol";


struct Gauge {
    address gaugeAddress;
    address stakingToken;
}


/**
 * @title Adapter for Curve protocol (liquidity gauges).
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveStakingAdapter is ProtocolAdapter, Ownable {

    string public constant override adapterType = "Asset";

    string public constant override tokenType = "ERC20";

    // Returns the gauge where the given token is a staking token
    mapping(address => address) internal gauge_;

    event GaugeSet(
        address indexed gaugeAddress,
        address indexed stakingToken
    );

    function setGauges(Gauge[] calldata gauges) external onlyOwner {
        uint256 length = gauges.length;

        for (uint256 i = 0; i < length; i++) {
            setGauge(gauges[i]);
        }
    }

    /**
     * @return Amount of staked tokens for a given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        return ERC20(gauge_[token]).balanceOf(account);
    }

    function getGaugeAddress(address token) external view returns (address) {
        return gauge_[token];
    }

    function setGauge(Gauge memory gauge) internal {
        gauge_[gauge.stakingToken] = gauge.gaugeAddress;

        emit GaugeSet(gauge.gaugeAddress, gauge.stakingToken);
    }
}
