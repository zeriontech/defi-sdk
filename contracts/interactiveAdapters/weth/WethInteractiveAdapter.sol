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
contract WethInteractiveAdapter is InteractiveAdapter, WethAdapter {

    using SafeERC20 for ERC20;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /**
     * @notice Wraps Ether in Wrapped Ether.
     * @param tokens Array with one element - 0xEeee...EEeE constant.
     * @param amounts Array with one element - ETH amount to be converted to WETH.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with one element - WETH.
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
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "WIA: should be 1 token/amount/type!");
        require(tokens[0] == ETH, "WIA: ETH only!");

        uint256 amount = getAbsoluteAmountDeposit(tokens[0], amounts[0], amountTypes[0]);

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = WETH;

        try WETH9(WETH).deposit.value(amount)() {
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("WIA: deposit fail!");
        }
    }

    /**
     * @notice Unwraps Ether from Wrapped Ether.
     * @param tokens Array with one element - WETH address.
     * @param amounts Array with one element - WETH amount to be converted to ETH.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Empty array (ETH is sent back).
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
        returns (address[] memory tokensToBeWithdrawn)
    {
        require(tokens.length == 1, "WIA: should be 1 token/amount/type!");
        require(tokens[0] == WETH, "WIA: ETH only!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);

        try WETH9(WETH).withdraw(amount) {
        } catch Error(string memory reason) {
            revert(reason);
        } catch (bytes memory) {
            revert("WIA: withdraw fail!");
        }

        tokensToBeWithdrawn = new address[](0);
    }
}
