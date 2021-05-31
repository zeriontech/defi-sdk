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

    /**
        @notice Burns pool tokens from the caller and returns underlying assets
    */
    function exitPool(uint256 _amount, uint16 _referral) external;

    /**
        @notice Get the amount of tokens owned by the pool
        @param _token Addres of the token
        @return Amount owned by the contract
    */
    function balance(address _token) external view returns (uint256);

    /**
        @notice Get the tokens in the pool
        @return Array of tokens in the pool
    */
    function getTokens() external view returns (address[] memory);

    /**
        @notice Checks if a token was added to the pool
        @param _token address of the token
        @return If token is in the pool or not
    */
    function getTokenInPool(address _token) external view returns (bool);

    /**
        @notice Calculate the amounts of underlying needed to mint that pool amount.
        @param _amount Amount of pool tokens to mint
        @return tokens Tokens needed
        @return amounts Amounts of underlying needed
    */
    function calcTokensForAmount(uint256 _amount)
        external
        view
        returns (address[] memory tokens, uint256[] memory amounts);

    /**
        @notice Calculate the amounts of underlying to receive when burning that pool amount
        @param _amount Amount of pool tokens to burn
        @return tokens Tokens returned
        @return amounts Amounts of underlying returned
    */
    function calcTokensForAmountExit(uint256 _amount)
        external
        view
        returns (address[] memory tokens, uint256[] memory amounts);
}
