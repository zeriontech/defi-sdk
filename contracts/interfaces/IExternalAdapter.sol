// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface IExternalAdapter {
    function getTotalClusterBalance(address _asset, address _user) external returns (uint256);

    function deposit(address _asset) external payable returns (uint256);

    function withdraw(address _asset, uint256 _amount) external returns (uint256);
}
