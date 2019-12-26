pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import { ProtocolWrapper } from "./ProtocolWrapper.sol";
import { ProtocolBalance, AssetBalance } from "./Structs.sol";


contract ProtocolWrapperMock {

    mapping (address => uint256) internal balances;
    address[] public assets;

    constructor() public {
        balances[msg.sender] = 1000;
        assets.push(address(123));
    }

    function getProtocolBalance(address user) external view returns (ProtocolBalance memory) {
        uint256 length = assets.length;
        AssetBalance[] memory assetBalances = new AssetBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            assetBalances[i] = AssetBalance({
                asset: assets[i],
                amount: assetAmount(assets[i], user),
                decimals: 18
            });
        }

        return ProtocolBalance({
            name: protocolName(),
            balances: assetBalances
        });
    }

    function protocolName() public pure returns(string memory) {
        return("Mock");
    }

    function assetAmount(address, address user) internal view returns(uint256) {
        return balances[user];
    }
}