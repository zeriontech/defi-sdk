// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.6;

import "./ERC20.sol";

interface IEmiswapRegistry {
    function pools(ERC20 token1, ERC20 token2)
        external
        view
        returns (IEmiswap);

    function isPool(address addr) external view returns (bool);

    function deploy(ERC20 tokenA, ERC20 tokenB) external returns (IEmiswap);
    function getAllPools() external view returns (IEmiswap[] memory);
}

interface IEmiswap {
    function fee() external view returns (uint256);

    function tokens(uint256 i) external view returns (ERC20);

    function deposit(
        uint256[] calldata amounts,
        uint256[] calldata minAmounts,
        address referral
    ) external payable returns (uint256 fairSupply);

    function withdraw(uint256 amount, uint256[] calldata minReturns) external;

    function getBalanceForAddition(ERC20 token)
        external
        view
        returns (uint256);

    function getBalanceForRemoval(ERC20 token) external view returns (uint256);

    function getReturn(
        ERC20 fromToken,
        ERC20 destToken,
        uint256 amount
    ) external view returns (uint256, uint256);

    function swap(
        ERC20 fromToken,
        ERC20 destToken,
        uint256 amount,
        uint256 minReturn,
        address to,
        address referral
    ) external payable returns (uint256 returnAmount);

    function initialize(ERC20[] calldata assets) external;
}
