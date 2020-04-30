pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { WethAdapter } from "../../adapters/weth/WethAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev WETH9 contract interface.
 * Only the functions required for WethInteractiveAdapter contract are added.
 * The WETH9 contract is available here
 * github.com/0xProject/0x-monorepo/blob/development/contracts/erc20/contracts/src/WETH9.sol.
 */
interface WETH9 {
    function deposit() external payable;
    function withdraw(uint256) external;
}


/**
 * @title Interactive adapter for Wrapped Ether.
 * @dev Implementation of InteractiveAdapter abstract contract.
 */
contract CompoundAssetInteractiveAdapter is InteractiveAdapter, WethAdapter {

    using SafeERC20 for ERC20;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Wraps Ether in Wrapped Ether.
     * @param tokens Array with one element - 0xEeee...EEeE constant.
     * @param amounts Array with one element - ETH amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @return Tokens sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory)
    {
        require(tokens.length == 1, "WIA: should be 1 token/amount/type!");

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        address[] memory tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = WETH;

        WETH9(WETH).deposit.value(amount)();

        return tokensToBeWithdrawn;
    }

    /**
     * @notice Unwraps Ether from Wrapped Ether.
     * @param tokens Array with one element - ETH constant.
     * @param amounts Array with one element - ETH amount to be withdrawn.
     * @param amountTypes Array with one element - amount type.
     * @return Tokens sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory
    )
        public
        payable
        override
        returns (address[] memory)
    {
        require(tokens.length == 1, "WIA: should be 1 token/amount/type!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        try WETH9(WETH).withdraw(amount) {
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("WIA: withdraw fail!");
        }

        address[] memory tokensToBeWithdrawn = new address[](0);

        return tokensToBeWithdrawn;
    }
}
