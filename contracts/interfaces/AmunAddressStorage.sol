// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface AmunAddressStorage {
    function interestTokenToUnderlyingStablecoin(address) external view returns (address);
}
