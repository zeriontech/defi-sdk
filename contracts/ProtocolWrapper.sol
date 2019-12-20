pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import { ProtocolBalance, AssetBalance } from "Structs.sol";


interface IERC20 {
    function decimals() external view returns(uint8);
}


abstract contract ProtocolWrapper {

    address public owner;
    address[] public supportedAssets;

    constructor(address[] memory _supportedAssets) internal {
        require(_supportedAssets.length != 0, "PW: empty _supportedAssets array in constructor!");

        owner = msg.sender;
        supportedAssets = _supportedAssets;
    }

    function balance(address user)
        external
        view
        returns (ProtocolBalance memory protocolBalance)
    {
        uint256 length = supportedAssets.length;
        AssetBalance[] memory assetBalances = new AssetBalance[](length);

        for(uint256 i = 0; i < length; i++) {
            assetBalances[i] = AssetBalance({
                asset: supportedAssets[i],
                amount: assetAmount(supportedAssets[i], user),
                decimals: IERC20(supportedAssets[i]).decimals()
            });
        }

        protocolBalance.name = protocolName();
        protocolBalance.balances = assetBalances;
    }

    function assetAmount(address asset, address user) 
        internal
        view
        virtual
        returns(uint256);

    function protocolName()
        public
        view
        virtuals
        returns(string memory);
}