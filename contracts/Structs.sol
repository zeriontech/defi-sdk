pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

struct AssetBalance {
    address asset;
    uint256 amount;
    uint8 decimals;
}


struct ProtocolBalance {
    string name;
    AssetBalance[] balances;
}