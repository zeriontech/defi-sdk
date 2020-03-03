pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;


struct ProtocolBalance {
    ProtocolInfo info;
    TokenBalanceAndComponents[] balances;
}


struct ProtocolInfo {
    string name;
    string description;
    string protocolType;
    string tokenType;
    string iconURL;
    uint256 version;
}


struct TokenBalanceAndComponents {
    TokenInfo info;
    uint256 balance;
    TokenBalance[] components;
}


struct TokenBalance {
    TokenInfo info;
    uint256 balance;
}


struct TokenInfo {
    address tokenAddress;
    string name;
    string symbol;
    uint8 decimals;
}


struct ProtocolAdapter {
    address adapter;
    uint256 addedAt;
    address[] supportedTokens;
}


struct Token {
    address tokenAddress;
    string tokenType;
    uint256 value;
}
