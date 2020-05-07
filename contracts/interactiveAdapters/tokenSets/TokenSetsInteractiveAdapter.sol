// Copyright (C) 2020 Zerion Inc. <https://zerion.io>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { SafeERC20 } from "../../SafeERC20.sol";
import { Action, AmountType } from "../../Structs.sol";
import { TokenSetsAdapter } from "../../adapters/tokenSets/TokenSetsAdapter.sol";
import { InteractiveAdapter } from "../InteractiveAdapter.sol";


/**
 * @dev RebalancingSetIssuanceModule contract interface.
 * Only the functions required for TokenSetsInteractiveAdapter contract are added.
 * The RebalancingSetIssuanceModule contract is available here
 * github.com/SetProtocol/set-protocol-contracts/blob/master/contracts/core/modules/RebalancingSetIssuanceModule.sol.
 */
interface RebalancingSetIssuanceModule {
    function issueRebalancingSet(address, uint256, bool) external;
    function issueRebalancingSetWrappingEther(address, uint256, bool) external payable;
    function redeemRebalancingSet(address, uint256, bool) external;
    function redeemRebalancingSetUnwrappingEther(address, uint256, bool) external;
}


/**
 * @dev SetToken contract interface.
 * Only the functions required for TokenSetsInteractiveAdapter contract are added.
 * The SetToken contract is available here
 * github.com/SetProtocol/set-protocol-contracts/blob/master/contracts/core/tokens/SetToken.sol.
 */
interface SetToken {
    function getComponents() external view returns(address[] memory);
}


/**
 * @dev RebalancingSetToken contract interface.
 * Only the functions required for TokenSetsInteractiveAdapter contract are added.
 * The RebalancingSetToken contract is available here
 * github.com/SetProtocol/set-protocol-contracts/blob/master/contracts/core/tokens/RebalancingSetTokenV3.sol.
 */
interface RebalancingSetToken {
    function currentSet() external view returns (SetToken);
}


/**
 * @title Interactive adapter for TokenSets.
 * @dev Implementation of InteractiveAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract TokenSetsInteractiveAdapter is InteractiveAdapter, TokenSetsAdapter {

    using SafeERC20 for ERC20;

    address internal constant TRANSFER_PROXY = 0x882d80D3a191859d64477eb78Cca46599307ec1C;
    address internal constant ISSUANCE_MODULE = 0xDA6786379FF88729264d31d472FA917f5E561443;

    /**
     * @notice Deposits tokens to the TokenSet.
     * @param tokens Array with one element - payment token address.
     * @param amounts Array with one element - payment token amount to be deposited.
     * @param amountTypes Array with one element - amount type.
     * @param data ABI-encoded additional parameters:
     *     - rebalancingSetAddress - rebalancing set address;
     *     - rebalancingSetQuantity - rebalancing set amount to be minted;
     * @return tokensToBeWithdrawn Array with one element - rebalancing set address.
     * @dev Implementation of InteractiveAdapter function.
     */
    function deposit(
        address[] memory tokens,
        uint256[] memory amounts,
        AmountType[] memory amountTypes,
        bytes memory data
    )
        public
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
    {
        uint256 absoluteAmount;
        for (uint256 i = 0; i < tokens.length; i++) {
            absoluteAmount = getAbsoluteAmountDeposit(tokens[i], amounts[i], amountTypes[i]);
            ERC20(tokens[i]).safeApprove(TRANSFER_PROXY, absoluteAmount, "TSIA![1]");
        }

        (address setAddress, uint256 setQuantity) = abi.decode(data, (address, uint256));

        tokensToBeWithdrawn = new address[](1);
        tokensToBeWithdrawn[0] = setAddress;

        try RebalancingSetIssuanceModule(ISSUANCE_MODULE).issueRebalancingSet(
            setAddress,
            setQuantity,
            false
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch (bytes memory) {
            revert("TSIA: tokenSet fail!");
        }

        for (uint256 i = 0; i < tokens.length; i++) {
            ERC20(tokens[i]).safeApprove(TRANSFER_PROXY, 0, "TSIA![2]");
        }
    }

    /**
     * @notice Withdraws tokens from the TokenSet.
     * @param tokens Array with one element - rebalancing set address.
     * @param amounts Array with one element - rebalancing set amount to be burned.
     * @param amountTypes Array with one element - amount type.
     * @return tokensToBeWithdrawn Array with one element - set token components.
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
        require(tokens.length == 1, "TSIA: should be 1 token/amount/type!");

        uint256 amount = getAbsoluteAmountWithdraw(tokens[0], amounts[0], amountTypes[0]);
        RebalancingSetIssuanceModule issuanceModule = RebalancingSetIssuanceModule(ISSUANCE_MODULE);
        RebalancingSetToken rebalancingSetToken = RebalancingSetToken(tokens[0]);
        SetToken setToken = rebalancingSetToken.currentSet();
        tokensToBeWithdrawn = setToken.getComponents();

        try issuanceModule.redeemRebalancingSet(
            tokens[0],
            amount,
            false
        ) {} catch Error(string memory reason) { // solhint-disable-line no-empty-blocks
            revert(reason);
        } catch (bytes memory) {
            revert("TSIA: tokenSet fail!");
        }
    }
}
