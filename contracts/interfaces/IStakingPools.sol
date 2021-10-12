// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

interface IStakingPools {
    struct UserInfo {
        uint256 amount; // How many ASSET tokensens the user has provided.
        uint256[] rewardsDebts; // Order like in AssetInfo rewardsTokens
    }
    struct PoolInfo {
        address assetToken; // Address of LP token contract.
        uint256 lastRewardBlock; // Last block number that DHVs distribution occurs.
        uint256[] accumulatedPerShare; // Accumulated token per share, times token decimals. See below.
        address[] rewardsTokens; // Must be constant.
        uint256[] rewardsPerBlock; // Tokens to distribute per block.
        uint256[] accuracy; // Tokens accuracy.
        uint256 poolSupply; // Total amount of deposits by users.
        bool paused;
    }

    function poolInfo(uint256 _pid) external view returns (PoolInfo memory);

    function userInfo(uint256 _pid, address _user) external view returns (uint256);

    function addPool(
        uint256 _pid,
        address _assetAddress,
        address[] calldata _rewardsTokens,
        uint256[] calldata _rewardsPerBlock
    ) external;

    function updatePoolSettings(
        uint256 _pid,
        uint256[] calldata _rewardsPerBlock,
        bool _withUpdate
    ) external;

    function setOnPause(address _assetAddress, bool _paused) external;

    function pendingRewards(uint256 _pid, address _user) external view returns (uint256[] memory amounts);

    function updatePool(uint256 _pid) external;

    function deposit(uint256 _pid, uint256 _amount) external;

    function depositFor(uint256 _pid, uint256 _amount, address _user) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function claimRewards(uint256 _pid) external;

    function poolExist(uint256 _pid) external view returns (bool);
}
