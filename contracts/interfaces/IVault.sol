pragma solidity 0.7.3;

interface IVault {
    function underlying() external view returns (address);

    function deposit(uint256 amountWei, uint16 referral) external;

    function withdraw(uint256 numberOfShares, uint16 referral) external;

    function getPricePerFullShare() external view returns (uint256);
}
