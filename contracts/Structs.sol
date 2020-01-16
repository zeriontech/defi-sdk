pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

struct ProtocolBalance {
    string name;
    AssetBalance[] balances;
    Rate[] rates;
}


struct AssetBalance {
    address asset;
    uint256 amount;
    uint8 decimals;
}


struct Rate {
    address asset;
    Component[] components;
}


struct Component {
    address underlying;
    uint256 rate;
}


struct Action {
    ActionType actionType;
    address protocolWrapper;
    address asset;
    uint256 amount;
    AmountType amountType;
    bytes data;
}


enum ActionType { None, Deposit, Withdraw }


enum AmountType { None, Relative, Absolute }
