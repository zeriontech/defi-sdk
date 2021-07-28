// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity 0.7.6;

interface IAmunBasket {
    function joinPool(uint256 _amount, uint16 _referral) external;

    function exitPool(uint256 _amount, uint16 _referral) external;

    function getEntryFee() external view returns (uint256);

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
