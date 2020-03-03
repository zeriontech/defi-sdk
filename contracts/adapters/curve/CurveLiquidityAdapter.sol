pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../Adapter.sol";
import { ProtocolInfo, Token } from "../../Structs.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveLiquidityAdapter contract are added.
 * The stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
// solhint-disable-next-line contract-name-camelcase
interface stableswap {
    function coins(int128) external view returns (address);
    function balances(int128) external view returns (uint256);
}


/**
 * @title Adapter for Curve protocol.
 * @dev Implementation of Adapter interface.
 */
abstract contract CurveLiquidityAdapter is Adapter {

    /**
     * @return ProtocolInfo struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getInfo() external pure override returns (ProtocolInfo memory) {
        return ProtocolInfo({
            name: getProtocolName(),
            description: "Exchange liquidity pool for stablecoin trading",
            adapterType: "Asset",
            tokenType: "Curve token",
            iconURL: "protocol-icons.s3.amazonaws.com/curve.fi.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of Curve pool tokens held by the given user.
     * @dev Implementation of Adapter interface function.
     */
    function getBalance(address token, address user) external view override returns (uint256) {
        return ERC20(token).balanceOf(user);
    }

    /**
     * @dev This function has to be implemented.
     */
    function getProtocolName() internal pure virtual returns (string memory);

    /**
     * @dev This function has to be implemented.
     */
    function getTokenType() internal pure virtual returns (string memory);
}
