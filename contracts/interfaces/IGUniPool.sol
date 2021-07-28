// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6;

interface IGUniPool {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function upperTick() external view returns (int24);

    function lowerTick() external view returns (int24);

    function pool() external view returns (address);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function mint(uint256 mintAmount, address receiver)
        external
        returns (
            uint256 amount0,
            uint256 amount1,
            uint128 liquidityMinted
        );

    function burn(uint256 burnAmount, address receiver)
        external
        returns (
            uint256 amount0,
            uint256 amount1,
            uint128 liquidityBurned
        );

    function getMintAmounts(uint256 amount0Max, uint256 amount1Max)
        external
        view
        returns (
            uint256 amount0,
            uint256 amount1,
            uint256 mintAmount
        );

    function getUnderlyingBalances() external view returns (uint256 amount0, uint256 amount1);

    function getPositionID() external view returns (bytes32 positionID);
}
