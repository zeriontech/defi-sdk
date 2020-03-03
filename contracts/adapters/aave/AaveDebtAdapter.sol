pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev LendingPoolAddressesProvider contract interface.
 * Only the functions required for AaveDepositAdapter contract are added.
 * The LendingPoolAddressesProvider contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/configuration/LendingPoolAddressesProvider.sol.
 */
interface LendingPoolAddressesProvider {
    function getLendingPool() external view returns (LendingPool);
}


/**
 * @dev LendingPool contract interface.
 * Only the functions required for AaveDepositAdapter contract are added.
 * The LendingPool contract is available here
 * github.com/aave/aave-protocol/blob/master/contracts/lendingpool/LendingPool.sol.
 */
interface LendingPool {
    function getUserReserveData(address, address) external view returns (uint256, uint256);
}


/**
 * @title Adapter for Aave protocol (debt).
 * @dev Implementation of Adapter interface.
 */
contract AaveDebtAdapter is Adapter {

    address internal constant PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: "Aave",
            description: "Decentralized lending & borrowing protocol",
            protocolType: "Debt",
            tokenType: "ERC20",
            iconURL: "protocol-icons.s3.amazonaws.com/aave.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of debt of the given user for the protocol.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        LendingPool pool = LendingPoolAddressesProvider(PROVIDER).getLendingPool();

        (, uint256 debtAmount) = pool.getUserReserveData(token, user);

        return debtAmount;
    }
}
