// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.3;

interface IHypervisor {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function pool() external view returns (address);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function deposit(
        uint256 deposit0,
        uint256 deposit1,
        address to
    ) external returns (uint256 shares);

    function withdraw(
        uint256 shares,
        address to,
        address from
    ) external returns (uint256 amount0, uint256 amount1);
}
