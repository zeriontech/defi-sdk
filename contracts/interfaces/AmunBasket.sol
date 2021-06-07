// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.1;

interface AmunBasket {
    function getEntryFee() external view returns (uint256);

    /**
        @notice Pulls underlying from caller and mints the pool token
        @param _amount Amount of pool tokens to mint
        @param _referral Partners may receive rewards with their referral code
    */
    function joinPool(uint256 _amount, uint16 _referral) external;

    function exitPool(uint256 _amount, uint16 _referral) external;

    function balance(address _token) external view returns (uint256);

    function getTokens() external view returns (address[] memory);

    function getTokenInPool(address _token) external view returns (bool);

    function calcTokensForAmount(uint256 _amount)
        external
        view
        returns (address[] memory tokens, uint256[] memory amounts);

    function calcTokensForAmountExit(uint256 _amount)
        external
        view
        returns (address[] memory tokens, uint256[] memory amounts);

    function calcOutStandingAnnualizedFee() external view returns (uint256);
}
