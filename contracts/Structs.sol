pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;


struct ProtocolBalancesAndRates {
    Protocol protocol;
    AssetBalance[] balances;
    AssetRate[] rates;
}


struct ProtocolBalances {
    Protocol protocol;
    AssetBalance[] balances;
}


struct ProtocolRates {
    Protocol protocol;
    AssetRate[] rates;
}


struct Protocol {
    string name;
    string description;
    string class;
    string icon;
    uint256 version;
}


struct AssetBalance {
    Asset asset;
    uint256 balance;
}


struct AssetRate {
    Asset asset;
    Component[] components;
}


struct Component {
    Asset underlying;
    uint256 rate;
}


struct Asset {
    address contractAddress;
    uint8 decimals;
    string symbol;
}
