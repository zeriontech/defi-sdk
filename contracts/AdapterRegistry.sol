pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { ProtocolAdapterManager } from "./ProtocolAdapterManager.sol";
import { TokenAdapterManager } from "./TokenAdapterManager.sol";
import { Adapter } from "./adapters/Adapter.sol";
import { TokenAdapter } from "./adapters/TokenAdapter.sol";
import { ProtocolAdapter, ProtocolBalance, TokenBalanceAndComponents, TokenBalance, Token } from "./Structs.sol";


/**
* @title Registry for protocol adapters.
* @notice getAssetBalances() and getAssetRates() functions
* with different arguments implement the main functionality.
*/
contract AdapterRegistry is ProtocolAdapterManager {

    constructor(
        string[] memory protocolAdapterNames,
        ProtocolAdapter[] memory protocolAdapters,
        string[] memory tokenAdapterNames,
        address[] memory tokenAdapters
    )
        public
        ProtocolAdapterManager(protocolAdapterNames, protocolAdapters)
        TokenAdapterManager(tokenAdapterNames, tokenAdapters)
    // solhint-disable-next-line no-empty-blocks
    {}

    /**
     * @return All the amounts of supported tokens
     * via supported adapters by the given user.
     */
    function getProtocolBalances(
        address user
    )
        external
        view
        returns (ProtocolBalance[] memory)
    {
        string[] memory protocolAdapterNames = getProtocolAdapters();
        uint256 length = protocolAdapterNames.length;
        ProtocolBalance[] memory protocolBalances =
            new ProtocolBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            protocolBalances[i] = getProtocolBalance(user, protocolAdapterNames[i]);
        }

        return protocolBalances;
    }

    /**
     * @return All the amounts of supported tokens
     * by the given adapter by the given user.
     */
    function getProtocolBalance(
        address user,
        string memory protocolAdapterName
    )
        public
        view
        returns (ProtocolBalance memory)
    {
        return getProtocolBalance(
            user,
            protocolAdapterName,
            protocolAdapter[protocolAdapterName].supportedTokens
        );
    }

    /**
     * @return All the amounts and rates of the given tokens
     * by the given adapter by the given user.
     */
    function getProtocolBalance(
        address user,
        string memory protocolAdapterName,
        address[] memory supportedTokens
    )
        public
        view
        returns (ProtocolBalance memory)
    {
        Adapter adapter = Adapter(protocolAdapter[protocolAdapterName].adapter);
        ProtocolBalance memory protocolBalance;
        protocolBalance.info = adapter.getInfo();

        TokenBalanceAndComponents[] memory tokenBalancesAndComponents = new TokenBalanceAndComponents[](supportedTokens.length);
        uint256 balance;

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            balance = adapter.getBalance(user, supportedTokens[i]); // TODO try-catch
            tokenBalancesAndComponents[i] = getTokenBalanceAndComponents(
                supportedTokens[i],
                protocolBalance.info.tokenType,
                balance
            );
        }

        protocolBalance.balances = tokenBalancesAndComponents;
        return protocolBalance;
    }

    /**
     * @return All the exchange rates of the given tokens by the given adapter.
     */
    function getUnderlyingTokens(
        string calldata tokenAdapterName,
        address token
    )
        external
        view
        returns (Token[] memory)
    {
        return TokenAdapter(tokenAdapter[tokenAdapterName]).getUnderlyingTokens(token);

    }

    function getTokenBalanceAndComponents(
        address token,
        string memory tokenType,
        uint256 balance
    )
        internal
        view
        returns (TokenBalanceAndComponents memory)
    {
        TokenAdapter tokenAdapter = TokenAdapter(getTokenAdapter(tokenType));
        Token[] memory components = tokenAdapter.getUnderlyingTokens(token); // TODO try-catch
        TokenBalance[] memory componentsBalances = new TokenBalance[](components.length);

        for (uint i = 0; i < components.length; i++) {
            componentsBalances[i] = getTokenBalance(
                components[i].tokenAddress,
                components[i].tokenType,
                components[i].value * balance
            );
        }

        return TokenBalanceAndComponents({
            info: tokenAdapter.getInfo(token),
            balance: balance,
            components: componentsBalances
        });
    }

    function getTokenBalance(
        address token,
        string memory tokenType,
        uint256 balance
    )
        internal
        view
        returns (TokenBalance memory)
    {
        TokenAdapter tokenAdapter = TokenAdapter(getTokenAdapter(tokenType));

        return TokenBalance({
            info: tokenAdapter.getInfo(token),
            balance: balance
        });
    }
}
