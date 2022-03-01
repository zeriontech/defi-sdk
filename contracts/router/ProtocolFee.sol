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

pragma solidity 0.8.12;

import { IProtocolFee } from "../interfaces/IProtocolFee.sol";
import { BadFeeShare, ZeroFeeBeneficiary, ZeroSigner } from "../shared/Errors.sol";
import { Ownable } from "../shared/Ownable.sol";
import { Fee } from "../shared/Structs.sol";

// solhint-disable code-complexity
contract ProtocolFee is IProtocolFee, Ownable {
    uint256 internal constant DELIMITER = 1e18; // 100%

    Fee private protocolFeeDefault_;
    address private protocolFeeSigner_;

    /**
     * @notice Emits old and new protocol fee signature signer
     * @param oldProtocolFeeSigner Old protocol fee signature signer
     * @param newProtocolFeeSigner New protocol fee signature signer
     */
    event ProtocolFeeSignerSet(
        address indexed oldProtocolFeeSigner,
        address indexed newProtocolFeeSigner
    );

    /**
     * @notice Emits old and new protocol fee defaults
     * @param oldProtocolFeeDefaultShare Old protocol fee default share
     * @param oldProtocolFeeDefaultBeneficiary Old protocol fee default beneficiary
     * @param newProtocolFeeDefaultShare New protocol fee default share
     * @param newProtocolFeeDefaultBeneficiary New protocol fee default beneficiary
     */
    event ProtocolFeeDefaultSet(
        uint256 oldProtocolFeeDefaultShare,
        address indexed oldProtocolFeeDefaultBeneficiary,
        uint256 newProtocolFeeDefaultShare,
        address indexed newProtocolFeeDefaultBeneficiary
    );

    /**
     * @inheritdoc IProtocolFee
     */
    function setProtocolFeeDefault(Fee calldata protocolFeeDefault) external override onlyOwner {
        if (protocolFeeDefault.share > uint256(0) && protocolFeeDefault.beneficiary == address(0))
            revert ZeroFeeBeneficiary();
        if (protocolFeeDefault.share > DELIMITER)
            revert BadFeeShare(protocolFeeDefault.share, DELIMITER);

        protocolFeeDefault_ = protocolFeeDefault;
    }

    /**
     * @inheritdoc IProtocolFee
     */
    function setProtocolFeeSigner(address signer) external override onlyOwner {
        if (signer == address(0)) revert ZeroSigner();

        protocolFeeSigner_ = signer;
    }

    /**
     * @inheritdoc IProtocolFee
     */
    function getProtocolFeeDefault() public view override returns (Fee memory protocolFeeDefault) {
        return protocolFeeDefault_;
    }

    /**
     * @inheritdoc IProtocolFee
     */
    function getProtocolFeeSigner() public view override returns (address protocolFeeSigner) {
        return protocolFeeSigner_;
    }
}
