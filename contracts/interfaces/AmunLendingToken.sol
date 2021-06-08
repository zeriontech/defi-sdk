pragma solidity 0.7.6;

interface AmunLendingToken {
    function create(
        address _investmentToken,
        uint256 _amount,
        address _recipient,
        uint256 _minimumReturn,
        uint16 _referral
    ) external returns (bool);

    function redeem(
        address _payoutToken,
        uint256 _amount,
        address _recipient,
        uint256 _minimumReturn,
        uint16 _referral
    ) external returns (bool);

    function limaTokenHelper() external view returns (address);

    function getUnderlyingTokenBalance() external view returns (uint256 balance);

    function getUnderlyingTokenBalanceOf(uint256 _amount) external view returns (uint256 balance);
}
