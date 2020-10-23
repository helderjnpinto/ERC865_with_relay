
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./ERC20.sol";
import "./EIP712MetaTransaction.sol";

contract ALKITOKEN is ERC20, EIP712MetaTransaction {

    constructor(string memory name, string memory symbol, string memory version, uint256 chainid, address relayerAddress) 
    ERC20(name, symbol)
    EIP712MetaTransaction(name, version, chainid, relayerAddress)
    public
    {
        _mint(msg.sender, 1000 * (10 ** 18));
    }

    function _transferERC20andFee(address signer, address to, uint256 value, uint256 fee) internal override {
        _transfer(signer, to, value);
        _transfer(signer, relayer, fee);
    }

}
