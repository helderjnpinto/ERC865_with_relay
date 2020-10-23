// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


import "./EIP712Base.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

abstract contract EIP712MetaTransaction is EIP712Base {
    using SafeMath for uint256;
    bytes32 private constant META_TRANSFER_TYPEHASH = keccak256(
        bytes(
            "MetaTransfer(address from, address to, uint256 value, uint256 fee, uint256 nonce)"
        )
    );
    address relayer;

    event RelayerChange(address newRelayer);

    // Prevent Replay attacks of accounts
    mapping(address => uint256) nonces;

    struct MetaTransfer {
        address from;
        address to;
        uint256 value;
        uint256 fee;
        uint256 nonce;
    }

    constructor(string memory name, string memory version, uint256 chainid, address relayerAddress)
        public
        EIP712Base(name, version, chainid)
    {
        relayer = relayerAddress;
    }

    modifier validateECDSA(bytes32 r, bytes32 s, uint8 v) {
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "ECDSA: invalid signature 's' value");
        require(v == 27 || v == 28, "ECDSA: invalid signature 'v' value");
        _;
    }

    modifier onlyRelayer() {
        require(relayer == msg.sender, "Invalid relayer address");
        _;
    }

    function changeRelayer(address newRelayer) public onlyRelayer {
        relayer = newRelayer;
        emit RelayerChange(newRelayer);
    }

    function executeMetaTransfer(
        address signer,
        address to,
        uint256 value,
        uint256 fee,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public
      onlyRelayer
      validateECDSA(r,s,v) 
      payable 
      {
        MetaTransfer memory metaTx = MetaTransfer({
            from: signer,
            to: to,
            value: value,
            fee: fee,
            nonce: nonces[signer]
        });

        require(
            verify(signer, toTypedMessageHash(hashMetaTransfer(metaTx)), r, s, v),
            "Signer and signature do not match"
        );
      
        _transferERC20andFee(signer, to, value, fee);

        nonces[signer] = nonces[signer].add(1);
        
    }

    function hashMetaTransfer(MetaTransfer memory metaTx)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    META_TRANSFER_TYPEHASH,
                    metaTx.from,
                    metaTx.to,
                    metaTx.value,
                    metaTx.fee,
                    metaTx.nonce
                )
            );
    }

    function getNonce(address user) public view returns (uint256 nonce) {
        nonce = nonces[user];
    }


    function _transferERC20andFee(address signer, address to, uint256 value, uint256 fee) internal virtual;
 
}
