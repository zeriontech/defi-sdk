pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundDebtAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function borrowBalanceStored(address) external view returns (uint256);
}


/**
 * @dev CompoundRegistry contract interface.
 * Only the functions required for CompoundDebtAdapter contract are added.
 * The CompoundRegistry contract is available in this repository.
 */
interface CompoundRegistry {
    function getCToken(address) external view returns (address);
}


/**
 * @title Debt adapter for Compound protocol.
 * @dev Implementation of Adapter interface.
 */
contract CompoundDebtAdapter is ProtocolAdapter {

    address internal constant REGISTRY = 0xE6881a7d699d3A350Ce5bba0dbD59a9C36778Cb7;

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
     * @return Amount of debt of the given account for the protocol.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        CToken cToken = CToken(CompoundRegistry(REGISTRY).getCToken(token));

        return cToken.borrowBalanceStored(account);
    }
}
