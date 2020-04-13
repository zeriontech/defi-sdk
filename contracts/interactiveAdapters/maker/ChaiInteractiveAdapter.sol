pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { ChaiAdapter } from "../../adapters/maker/ChaiAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev Chai contract interface.
 * Only the functions required for ChaiAdapter contract are added.
 * The Chai contract is available here
 * github.com/dapphub/chai/blob/master/src/chai.sol.
 */
interface Chai {
    function join(address, uint) external;
    function exit(address, uint) external;
}


/**
 * @title Interactive adapter for Chai contract.
 * @dev Implementation of InteractiveAdapter interface.
 */
contract ChaiInteractiveAdapter is InteractiveAdapter, ChaiAdapter {

    using SafeERC20 for ERC20;

    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address internal constant CHAI = 0x06AF07097C9Eeb7fD685c692751D5C66dB49c215;

    /**
     * @notice Deposits tokens to the Chai contract.
     * @param amounts Array with one element - DAI amount to be deposited.
     * @return Tokens sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] calldata,
        uint256[] calldata amounts,
        AmountType[] calldata amountTypes,
        bytes calldata
    )
        external
        payable
        override
        returns (address[] memory)
    {
        require(amounts.length == 1,  "CIA: should be 1 amount!");
        require(amountTypes.length == 1,  "CIA: should be 1 type!");

        uint256 amount = getAbsoluteAmountDeposit(DAI, amounts[0], amountTypes[0]);
        ERC20(DAI).safeApprove(CHAI, amount);
        Chai(CHAI).join(address(this), amount);

        address[] memory tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = CHAI;
        return tokensToBeWithdrawn;
    }

    /**
     * @notice Withdraws tokens from the Chai contract.
     * @param amounts Array with one element - CHAI amount to be withdrawn.
     * @return Tokens sent back to the msg.sender.
     * @dev Implementation of InteractiveAdapter function.
     */
    function withdraw(
        address[] calldata,
        uint256[] calldata amounts,
        AmountType[] calldata amountTypes,
        bytes calldata
    )
        external
        payable
        override
        returns (address[] memory)
    {
        require(amounts.length == 1, "CIA: should be 1 amount!");

        uint256 amount = getAbsoluteAmountWithdraw(CHAI, amounts[0], amountTypes[0]);
        Chai(CHAI).exit(address(this), amount);

        address[] memory tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = DAI;
        return tokensToBeWithdrawn;
    }
}
