pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { CompoundAssetAdapter } from "../../adapters/compound/CompoundAssetAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev CEther contract interface.
 * Only the functions required for CompoundAssetInteractiveAdapter contract are added.
 * The CEther contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CEther.sol.
 */
interface CEther {
    function mint() external payable;
}


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundAssetInteractiveAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function mint(uint256) external returns (uint256);
    function redeem(uint256) external returns (uint256);
    function underlying() external view returns (address);
}


/**
 * @title Interactive adapter for Compound protocol.
 * @dev Implementation of InteractiveAdapter interface.
 */
contract CompoundAssetInteractiveAdapter is InteractiveAdapter, CompoundAssetAdapter {

    using SafeERC20 for ERC20;

    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;

    /**
     * @notice Deposits tokens to the Compound protocol.
     * @param tokens Array with one element - cToken address.
     * @param amounts Array with one element - underlying token amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @return Tokens sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] calldata tokens,
        uint256[] calldata amounts,
        AmountType[] calldata amountTypes,
        bytes calldata
    )
        external
        payable
        override
        returns (address[] memory)
    {
        require(tokens.length == 1, "CAIA: should be 1 token!");
        require(amounts.length == 1,  "CAIA: should be 1 amount!");
        require(amountTypes.length == 1,  "CAIA: should be 1 type!");

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        address[] memory tokensToBeWithdrawn = new address[](1);

        if (tokens[0] == CETH) {
            CEther(CETH).mint.value(amount)();

            tokensToBeWithdrawn[0] = CETH;
            return tokensToBeWithdrawn;
        } else {
            CToken cToken = CToken(tokens[0]);
            ERC20 underlying = ERC20(cToken.underlying());

            underlying.safeApprove(tokens[0], amount);
            require(cToken.mint(amount) == 0, "CAIA: deposit failed!");

            tokensToBeWithdrawn[0] = tokens[0];
            return tokensToBeWithdrawn;
        }
    }

    /**
     * @notice Withdraws tokens from the Compound protocol.
     * @param tokens Array with one element - cToken address.
     * @param amounts Array with one element - cToken amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return Tokens sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] calldata tokens,
        uint256[] calldata amounts,
        AmountType[] calldata amountTypes,
        bytes calldata
    )
        external
        payable
        override
        returns (address[] memory)
    {
        require(tokens.length == 1, "CAIA: should be 1 token!");
        require(amounts.length == 1, "CAIA: should be 1 amount!");
        require(amountTypes.length == 1,  "CAIA: should be 1 type!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        CToken cToken = CToken(tokens[0]);

        require(cToken.redeem(amount) == 0, "CAIA: withdraw failed!");

        address[] memory tokensToBeWithdrawn;

        if (tokens[0] == CETH) {
            tokensToBeWithdrawn = new address[](0);
        } else {
            tokensToBeWithdrawn = new address[](1);
            tokensToBeWithdrawn[0] = cToken.underlying();
        }

        return tokensToBeWithdrawn;
    }

//    /**
//     * @dev This implementation resolves the ambiguity due to inheritance.
//     */
//    function getBalance(
//        address token,
//        address account
//    )
//        public
//        view
//        override(InteractiveAdapter, CompoundAssetAdapter)
//        returns (uint256)
//    {
//        return CompoundAssetAdapter.getBalance(token, account);
//    }
}
