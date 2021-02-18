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

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { ReflexerAdapter } from "./ReflexerAdapter.sol";


/**
 * @dev SAFEEngine contract interface.
 * Only the functions required for ReflexerDebtAdapter contract are added.
 * The SAFEEngine contract is available here
 * github.com/reflexer-labs/geb/blob/master/src/SAFEEngine.sol.
 */
interface SAFEEngine {
    function safes(bytes32, address) external view returns (uint256, uint256);
    function collateralTypes(bytes32) external view returns (uint256, uint256);
}


/**
 * @dev TaxCollector contract interface.
 * Only the functions required for ReflexerDebtAdapter contract are added.
 * The TaxCollector contract is available here
 * github.com/makerdao/dss/blob/master/src/taxCollector.sol.
 */
interface TaxCollector {
    function collateralTypes(bytes32) external view returns (uint256, uint256);
    function base() external view returns (uint256);
}


/**
 * @dev GebSafeManager contract interface.
 * Only the functions required for ReflexerDebtAdapter contract are added.
 * The GebSafeManager contract is available here
 * github.com/reflexer-labs/geb-safe-manager/blob/master/src/GebSafeManager.sol.
 */
interface GebSafeManager {
    function firstSAFEID(address) external view returns (uint256);
    function safeList(uint256) external view returns (uint256, uint256);
    function safes(uint256) external view returns (address);
    function collateralTypes(uint256) external view returns (bytes32);
}


/**
 * @title Debt adapter for Reflexer protocol.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract ReflexerDebtAdapter is ProtocolAdapter, ReflexerAdapter {

    string public constant override adapterType = "Debt";

    string public constant override tokenType = "ERC20";

    /**
     * @return Amount of debt of the given account for the protocol.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        GebSafeManager manager = GebSafeManager(MANAGER);
        SAFEEngine safeEngine = SAFEEngine(SAFE_ENGINE);
        TaxCollector taxCollector = TaxCollector(TAX_COLLECTOR);
        uint256 id = manager.firstSAFEID(account);
        bytes32 collateralType;
        uint256 generatedDebt;
        uint256 accumulatedRate;
        uint256 debtAmount;
        uint256 updateTime;
        uint256 totalValue = 0;

        while (id > 0) {
            collateralType = manager.collateralTypes(id);
            (, generatedDebt) = safeEngine.safes(collateralType, manager.safes(id));
            (, id) = manager.safeList(id);
            (, accumulatedRate) = safeEngine.collateralTypes(collateralType);
            (debtAmount, updateTime) = taxCollector.collateralTypes(collateralType);
            uint256 currentRate = rmultiply(
                rpow(
                    addition(taxCollector.globalStabilityFee(), debtAmount),
                    // solhint-disable-next-line not-rely-on-time
                    now - updateTime,
                    RAY
                ),
                accumulatedRate
            );

            totalValue = totalValue + rmultiply(generatedDebt, currentRate);
        }

        return totalValue;
    }
}
