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

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";

/**
 * @dev SmartToken contract interface.
 * Only the functions required for BancorTokenAdapter contract are added.
 * The SmartToken contract is available here
 * github.com/bancorprotocol/contracts/blob/master/solidity/contracts/token/SmartToken.sol.
 */
interface SmartToken {
    function owner() external view returns (address);

    function totalSupply() external view returns (uint256);
}

/**
 * @dev BancorConverter contract interface.
 * Only the functions required for BancorTokenAdapter contract are added.
 * The BancorConverter contract is available here
 * github.com/bancorprotocol/contracts/blob/master/solidity/contracts/converter/BancorConverter.sol.
 */
interface BancorConverter {
    function connectorTokenCount() external view returns (uint256);

    function connectorTokens(uint256) external view returns (address);
}

/**
 * @dev ContractRegistry contract interface.
 * Only the functions required for BancorTokenAdapter contract are added.
 * The ContractRegistry contract is available here
 * github.com/bancorprotocol/contracts/blob/master/solidity/contracts/utility/ContractRegistry.sol.
 */
interface ContractRegistry {
    function addressOf(bytes32) external view returns (address);
}

/**
 * @dev BancorFormula contract interface.
 * Only the functions required for BancorTokenAdapter contract are added.
 * The BancorFormula contract is available here
 * github.com/bancorprotocol/contracts/blob/master/solidity/contracts/converter/BancorFormula.sol.
 */
interface BancorFormula {
    function calculateLiquidateReturn(
        uint256,
        uint256,
        uint32,
        uint256
    ) external view returns (uint256);
}

/**
 * @title Token adapter for SmartTokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BancorTokenAdapter is TokenAdapter {
    address internal constant REGISTRY = 0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address formula = ContractRegistry(REGISTRY).addressOf("BancorFormula");
        uint256 totalSupply = SmartToken(token).totalSupply();
        address converter = SmartToken(token).owner();
        uint256 connectorTokenCount = BancorConverter(converter).connectorTokenCount();

        Component[] memory components = new Component[](connectorTokenCount);

        address underlyingToken;
        uint256 balance;
        for (uint256 i = 0; i < connectorTokenCount; i++) {
            underlyingToken = BancorConverter(converter).connectorTokens(i);

            if (underlyingToken == ETH) {
                balance = converter.balance;
            } else {
                balance = ERC20(underlyingToken).balanceOf(converter);
            }

            components[i] = Component({
                token: underlyingToken,
                rate: int256(
                    BancorFormula(formula).calculateLiquidateReturn(
                        totalSupply,
                        balance,
                        uint32(1000000),
                        uint256(1e18)
                    )
                )
            });
        }

        return components;
    }
}
