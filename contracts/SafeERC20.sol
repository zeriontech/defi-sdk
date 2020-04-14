pragma solidity 0.6.6;

import "./ERC20.sol";


/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token contract
 * returns false). Tokens that return no value (and instead revert or throw on failure)
 * are also supported, non-reverting calls are assumed to be successful.
 * To use this library you can add a `using SafeERC20 for ERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {

    function safeTransfer(
        ERC20 token,
        address to,
        uint256 value
    )
        internal
    {
        callOptionalReturn(
            token,
            abi.encodeWithSelector(
                token.transfer.selector,
                to,
                value
            )
        );
    }

    function safeTransferFrom(
        ERC20 token,
        address from,
        address to,
        uint256 value
    )
        internal
    {
        callOptionalReturn(
            token,
            abi.encodeWithSelector(
                token.transferFrom.selector,
                from,
                to,
                value
            )
        );
    }

    function safeApprove(
        ERC20 token,
        address spender,
        uint256 value
    )
        internal
    {
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: wrong approve call"
        );
        callOptionalReturn(
            token,
            abi.encodeWithSelector(
                token.approve.selector,
                spender,
                value
            )
        );
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract),
     * relaxing the requirement on the return value: the return value is optional
     * (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function callOptionalReturn(ERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking
        // mechanism, since we're implementing it ourselves.

        // We implement two-steps call as callee is a contract is a responsibility of a caller.
        //  1. The call itself is made, and success asserted
        //  2. The return value is decoded, which in turn checks the size of the returned data.

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "SafeERC20: call failed");

        if (returndata.length > 0) { // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: false returned");
        }
    }
}
