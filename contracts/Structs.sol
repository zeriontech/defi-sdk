pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;


struct ProtocolDetail {
    string name;
    AssetBalance[] balances;
    AssetRate[] rates;
}


struct ProtocolBalance {
    string name;
    AssetBalance[] balances;
}


struct ProtocolRate {
    string name;
    AssetRate[] rates;
}


struct AssetBalance {
    address asset;
    int128 amount;
    uint8 decimals;
}


struct AssetRate {
    address asset;
    Component[] components;
}


struct Component {
    address underlying;
    uint256 rate;
}


struct Action {
    ActionType actionType;
    address adapter;
    address[] assets;
    uint256[] amounts;
    AmountType[] amountTypes;
    bytes data;
}


struct Approval {
    address asset;
    uint256 amount;
}


enum ActionType { None, Deposit, Withdraw }


enum AmountType { None, Relative, Absolute }
