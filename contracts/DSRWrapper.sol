pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import { ProtocolWrapper } from "./ProtocolWrapper.sol";


interface Pot {
    function drip() external view returns(uint256);
    function pie(address) external view returns(uint256);
}


contract DSRWrapper is ProtocolWrapper {

    Pot public pot;

    constructor(address[] memory _supportedAssets, Pot _pot)
        public
        ProtocolWrapper(_supportedAssets)
    {
        require(address(_pot) != address(0), "PW: empty _pot address in constructor!");
        require(_supportedAssets[0] == address(0xdaaee), "DSRW: wrong DAI address!");
        require(_supportedAssets.length == 1, "DSRW: wrong assets number!");

        pot = _pot;
    }

    function assetAmount(address, address user)
        internal
        view
        override
        returns(uint256)
    {
        uint256 chi = pot.drip();
        return chi * pot.pie(user);
    }

    function protocolName()
        public
        view
        override
        returns(string memory)
    {
        return("DSR/MCD");
    }
}