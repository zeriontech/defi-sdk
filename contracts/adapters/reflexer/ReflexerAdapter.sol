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

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;


/**
 * @title Reflexer adapter abstract contract.
 * @dev Base contract for Reflexer adapters.
 * Math function are taken from the SAFEEngine contract available here
 * github.com/reflexer-labs/geb/blob/master/src/SAFEEngine.sol.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract ReflexerAdapter {
    address internal constant SAFE_ENGINE = 0xCC88a9d330da1133Df3A7bD823B95e52511A6962;
    address internal constant TAX_COLLECTOR = 0xcDB05aEda142a1B0D6044C09C64e4226c1a281EB;
    address internal constant MANAGER = 0xEfe0B4cA532769a3AE758fD82E1426a03A94F185;

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    uint256 internal constant RAY = 10 ** 27;

    function rpow(uint256 x, uint256 n, uint256 b) internal pure returns (uint256 z) {
        //solhint-disable-next-line no-inline-assembly
        assembly {
            switch x case 0 {switch n case 0 {z := b} default {z := 0}}
            default {
                switch mod(n, 2) case 0 { z := b } default { z := x }
                let half := div(b, 2)  // for rounding.
                for { n := div(n, 2) } n { n := div(n,2) } {
                    let xx := mul(x, x)
                    if iszero(eq(div(xx, x), x)) { revert(0,0) }
                    let xxRound := add(xx, half)
                    if lt(xxRound, xx) { revert(0,0) }
                    x := div(xxRound, b)
                    if mod(n,2) {
                        let zx := mul(z, x)
                        if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) { revert(0,0) }
                        let zxRound := add(zx, half)
                        if lt(zxRound, zx) { revert(0,0) }
                        z := div(zxRound, b)
                    }
                }
            }
        }
    }

    function rmultiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x * y;
        require(y == 0 || z / y == x, "ReflexerAdapter/rmul-overflow");
        z = z / RAY;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "ReflexerAdapter/multiply-uint-uint-overflow");
    }

    function addition(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x + y;
        require(z >= x, "ReflexerAdapter/add-uint-uint-overflow");
    }
}
