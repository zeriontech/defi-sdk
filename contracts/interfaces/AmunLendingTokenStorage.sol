pragma solidity 0.7.6;

interface AmunLendingTokenStorage {
    function currentUnderlyingToken() external view returns (address);

    function limaSwap() external view returns (address);
}
