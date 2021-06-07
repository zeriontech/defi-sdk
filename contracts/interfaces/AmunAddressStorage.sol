// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

interface AmunAddressStorage {
    function interestTokenToUnderlyingStablecoin(address) external view returns (address);
}
