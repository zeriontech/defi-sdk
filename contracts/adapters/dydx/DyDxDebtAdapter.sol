pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { DyDxAdapter } from "./DyDxAdapter.sol";


/**
 * @dev Info struct from Account library.
 * The Account library is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/lib/Account.sol.
 */
struct Info {
    address owner;  // The address that owns the account
    uint256 number; // A nonce that allows a single address to control many accounts
}


/**
 * @dev Wei struct from Types library.
 * The Types library is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/lib/Types.sol.
 */
struct Wei {
    bool sign; // true if positive
    uint256 value;
}


/**
 * @dev SoloMargin contract interface.
 * Only the functions required for DyDxDebtAdapter contract are added.
 * The SoloMargin contract is available here
 * github.com/dydxprotocol/solo/blob/master/contracts/protocol/SoloMargin.sol.
 */
interface SoloMargin {
    function getAccountWei(Info calldata, uint256) external view returns (Wei memory);
}


/**
 * @title Debt adapter for dYdX protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract DyDxDebtAdapter is ProtocolAdapter, DyDxAdapter {

    /**
     * @return Type of the adapter.
     */
    function adapterType() external pure override returns (string memory) {
        return "Debt";
    }

    /**
     * @return Type of the token used in adapter.
     */
    function tokenType() external pure override returns (string memory) {
        return "ERC20";
    }

    /**
     * @return Amount of tokens held by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        Wei memory accountWei = SoloMargin(SOLO).getAccountWei(Info(account, 0), getMarketId(token));
        return accountWei.sign ? 0 : accountWei.value;
    }
}
