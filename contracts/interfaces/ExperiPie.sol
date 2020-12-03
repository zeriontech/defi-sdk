pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

interface ExperiPie {
    function balance(address token) external view returns (uint256);

    function getTokens() external view returns (address[] memory);
}
