const sigUtil = require("eth-sig-util");
const web3_utils = require("web3-utils");

const domainType = [{
        name: "name",
        type: "string"
    },
    {
        name: "version",
        type: "string"
    },
    {
        name: "chainId",
        type: "uint256"
    },
    {
        name: "verifyingContract",
        type: "address"
    }
];
const metaTransactionType = [{
        name: "nonce",
        type: "uint256"
    },
    {
        name: "from",
        type: "address"
    },
    {
        name: "functionSignature",
        type: "bytes"
    }
];


const getSignatureParameters = (signature) => {
    if (!web3_utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = web3_utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};

module.exports = {
    domainType,
    metaTransactionType,
    domainData: function (contractAddress, parentChainId = 80001) {
        return {
            name: "AlkiToken",
            version: "1",
            chainId: parentChainId,
            verifyingContract: contractAddress
        };
    },
    encodeMetaTransfer: (from, to, value, fee, nonce) => {
        const _nonce = parseInt(nonce);
        return {
            from,
            to,
            value,
            fee,
            nonce: _nonce
        }
    },
    encodeDataToSign: function (metaTransfer, contractAddress, parentChainId = 80001) {
        const dataToSign = JSON.stringify({
            types: {
                EIP712Domain: domainType,
                MetaTransaction: metaTransactionType
            },
            domain: this.domainData(contractAddress, parentChainId),
            primaryType: "MetaTransfer",
            message: metaTransfer
        });

        return dataToSign;
    },
    getSignatureParameters,
    requestMetamaskSignTypedData_v4: function (web3, userAddress, dataToSign) {
        return await web3.eth.currentProvider.sendAsync({
            jsonrpc: "2.0",
            id: 1001,
            method: "eth_signTypedData_v4",
            params: [userAddress, dataToSign]
        });
    },
    recoverTypedSignature_v4: function (dataToSign, signature) {
        return sigUtil.recoverTypedSignature_v4({
            data: JSON.parse(dataToSign),
            sig: signature
        });
    },
    executeMetaTransferOn: function (contract, params, opts = {}) {
        return contract.methods
                .executeMetaTransaction(...params)
                .send(...opts);
    }
    
}
