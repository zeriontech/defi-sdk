pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import { ProtocolBalance, AssetBalance } from "./Structs.sol";


interface IERC20 {
    function decimals() external view returns(uint8);
}

/**
 * @title Base contract for protocol wrappers.
 * @dev protocolName() and assetAmount(address,address) functions must be implemented.
 */
abstract contract ProtocolWrapper {

    modifier onlyOwner {
        require(msg.sender == owner, "PW: onlyOwner function!");
        _;
    }

    address public owner;
    address[] public assets;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @param _assets Array with assets supported by the protocol.
     */
    constructor(address[] memory _assets) internal {
        require(_assets.length != 0, "PW: empty _assets array!");

        owner = msg.sender;
        assets = _assets;
    }

    /**
     * @notice Returns all the amounts of supported assets locked on the protocol by the given user.
     */
    function getProtocolBalance(address user) external view returns (ProtocolBalance memory) {
        uint256 length = assets.length;
        AssetBalance[] memory assetBalances = new AssetBalance[](length);

        for (uint256 i = 0; i < length; i++) {
            assetBalances[i] = AssetBalance({
                asset: assets[i],
                amount: assetAmount(assets[i], user),
                decimals: IERC20(assets[i]).decimals()
            });
        }

        return ProtocolBalance({
            name: protocolName(),
            balances: assetBalances
        });
    }

    /**
     * @notice Adds new asset to assets array.
     * The function is callable only by the owner.
     */
    function addAsset(address asset) external onlyOwner {
        assets.push(asset);
    }

    /**
    * @notice Removes one of the assets by its index.
    * The function is callable only by the owner.
    */
    function removeAsset(uint256 index) external onlyOwner {
        uint256 length = assets.length;
        require(index < length, "PW: index is too large!");
        if (index != length -1) {
            assets[index] = assets[length - 1];
        }
        assets.pop();
    }

    /**
     * @notice Transfers ownership to the desired address.
     * The function is callable only by the owner.
     */
    function transferOwnership(address _owner) external onlyOwner {
        require(_owner != address(0), "PW: new owner is the zero address");
        emit OwnershipTransferred(owner, _owner);
        owner = _owner;
    }

    /**
     * @dev The function must return the name of the protocol.
     */
    function protocolName() public pure virtual returns(string memory);

    /**
     * @dev The function must return the amount of given asset locked on the protocol by the given user.
     */
    function assetAmount(address asset, address user) internal view virtual returns(uint256);
}
