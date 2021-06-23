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

pragma solidity 0.8.4;

import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { AbsoluteTokenAmount, Input, SwapDescription } from "../shared/Structs.sol";

interface ISignatureVerifier {
    /**
     * @param hashToCheck Hash to be checked.
     * @param account Address of the hash will be checked for.
     * @return hashUsed True if hash has already been used by this account address.
     */
    function isHashUsed(bytes32 hashToCheck, address account)
        external
        view
        returns (bool hashUsed);

    /**
     * @param input Input struct to be hashed.
     * @param requiredOutput AbsoluteTokenAmount struct to be hashed.
     * @param swapDescription SwapDescription struct to be hashed.
     * @param account Account address to be hashed.
     * @param salt Salt parameter preventing double-spending to be hashed.
     * @return hashedData Execute data hashed with domainSeparator.
     */
    function hashData(
        Input memory input,
        AbsoluteTokenAmount memory requiredOutput,
        SwapDescription memory swapDescription,
        address account,
        uint256 salt
    ) external view returns (bytes32 hashedData);
}
