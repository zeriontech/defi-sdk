pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;


/**
 * @title Base contract for MCD and DSR adapters.
 */
abstract contract MKRAdapter {

    address constant internal VAT = 0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B;
    address constant internal POT = 0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7;
    address constant internal JUG = 0x19c0976f590D67707E62397C87829d896Dc0f1F1;
    address constant internal MANAGER = 0x5ef30b9986345249bc32d8928B7ee64DE9435E39;

    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address internal constant BAT = 0x0D8775F648430679A709E98d2b0Cb6250d2887EF;
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    uint256 constant internal ONE = 10 ** 27;

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

    function rmultiply(uint x, uint y) internal pure returns (uint z) {
        z = multiply(x, y) / ONE;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function addition(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x);
    }
}
