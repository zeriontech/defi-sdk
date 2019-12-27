pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import { ProtocolWrapper } from "./ProtocolWrapper.sol";


/**
 * @dev Pot contract interface.
 * Only the functions required for DSRWrapper contract are added.
 * The Pot contract is available here https://github.com/makerdao/dss/blob/master/src/pot.sol.
 */
interface Pot {
    function pie(address) external view returns(uint256);
    function dsr() external view returns(uint256);
    function rho() external view returns(uint256);
    function chi() external view returns(uint256);
}


/**
 * @title Wrapper for DSR protocol.
 * @dev Implementation of ProtocolWrapper abstract contract.
 */
contract DSRWrapper is ProtocolWrapper {

    Pot public pot;
    uint256 constant internal ONE = 10 ** 27;

    /**
     * @param _assets Only DAI token address is supported in DSR.
     * @param _pot Address of pot contract.
     */
    constructor(address[] memory _assets, Pot _pot) public ProtocolWrapper(_assets) {
        require(address(_pot) != address(0), "DSRW: empty _pot address!");
        require(_assets[0] == address(0x6B175474E89094C44Da98b954EedeAC495271d0F), "DSRW: wrong DAI address!");
        require(_assets.length == 1, "DSRW: wrong assets number!");

        pot = _pot;
    }

    /**
     * @notice Updates Pot contract address in case it was changed.
     * @param _pot New Pot contract address.
     */
    function updatePot(Pot _pot) external onlyOwner {
        require(address(_pot) != address(0), "DSRW: empty _pot address!");

        pot = _pot;
    }

    /**
     * @notice Returns name of the protocol.
     * @dev Implementation of ProtocolWrapper virtual function.
     */
    function protocolName() public pure override returns(string memory) {
        return("DSR");
    }

    /**
     * @notice Calculates the amount of DAI locked on DSR protocol.
     * @dev Implementation of ProtocolWrapper virtual function.
     * This function repeats the calculations made in drip() function of Pot contract.
     */
    function assetAmount(address, address user) internal view override returns(uint256) {
        uint256 chi = rmultiply(rpower(pot.dsr(), now - pot.rho(), ONE), pot.chi());
        return rmultiply(chi, pot.pie(user));
    }

    /**
     * @dev The function was copied from Pot contract in order to repeat computations.
     * The Pot contract is available here https://github.com/makerdao/dss/blob/master/src/pot.sol.
     */
    function rpower(uint x, uint n, uint base) internal pure returns (uint z) {
        assembly {
            switch x case 0 {switch n case 0 {z := base} default {z := 0}}
            default {
                switch mod(n, 2) case 0 { z := base } default { z := x }
                let half := div(base, 2)  // for rounding.
                for { n := div(n, 2) } n { n := div(n,2) } {
                let xx := mul(x, x)
                if iszero(eq(div(xx, x), x)) { revert(0,0) }
                let xxRound := add(xx, half)
                if lt(xxRound, xx) { revert(0,0) }
                x := div(xxRound, base)
                if mod(n,2) {
                    let zx := mul(z, x)
                    if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) { revert(0,0) }
                    let zxRound := add(zx, half)
                    if lt(zxRound, zx) { revert(0,0) }
                    z := div(zxRound, base)
                }
            }
            }
        }
    }

    /**
     * @dev The function was copied from Pot contract in order to repeat computations.
     * The function was renamed from rmul() in order to silence the compiler.
     * The Pot contract is available here https://github.com/makerdao/dss/blob/master/src/pot.sol.
     */
    function rmultiply(uint x, uint y) internal pure returns (uint z) {
        z = multiply(x, y) / ONE;
    }

    /**
     * @dev The function was copied from Pot contract in order to repeat computations.
     * The function was renamed from mul() in order to silence the compiler.
     * The Pot contract is available here https://github.com/makerdao/dss/blob/master/src/pot.sol.
     */
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
}
