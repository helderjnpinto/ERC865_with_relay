const sigUtil = require("eth-sig-util");
const utils = sigUtil.TypedDataUtils;
const web3_utils = require("web3-utils");

const ethUtil = require('ethereumjs-util');
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
const metaTransferTypes = [
    {
        name: "from",
        type: "address"
    },
    {
        name: "to",
        type: "address"
    },
    {
        name: "value",
        type: "uint256"
    },
    {
        name: "fee",
        type: "uint256"
    },
    {
        name: "nonce",
        type: "uint256"
    },
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
    metaTransferTypes,
    encodeMetaTransferType: function (types) {
        return ethUtil.bufferToHex(utils.hashType('MetaTransfer', types));
    },
    encodeDomainData: function (domainData, types) {
        return ethUtil.bufferToHex(utils.hashStruct('EIP712Domain', domainData, types));
    },
    encodePrimaryType: function (primaryType, message, types) {
        return ethUtil.bufferToHex(utils.hashStruct(primaryType, message, types));
    },
    encodeMetaTransferStruct: function (metaTransferData, types) {
        return ethUtil.bufferToHex(utils.hashStruct('MetaTransfer', metaTransferData, types));
    },
    domainData: function (contractAddress, parentChainId = 80001) {
        return {
            name: "Alki gold token",
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
        return {
            types: {
                EIP712Domain: domainType,
                MetaTransfer: metaTransferTypes
            },
            domain: this.domainData(contractAddress, parentChainId),
            primaryType: "MetaTransfer",
            message: metaTransfer
        };
    },
    getSignatureParameters,
    requestMetamaskSignTypedData_v4: async function (web3, userAddress, dataToSign) {
        const _dataToSign = dataToSign instanceof String ? dataToSign : JSON.stringify(dataToSign);
        return await web3.eth.currentProvider.sendAsync({
            jsonrpc: "2.0",
            id: 1001,
            method: "eth_signTypedData_v4",
            params: [userAddress, _dataToSign]
        });
    },
    signTypedData_v4: function (privateKey, dataToSign) {
        const _dataToSign = dataToSign instanceof String ? JSON.parse(dataToSign) : dataToSign;
        const _privateKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
        return sigUtil.signTypedData_v4(Buffer.from(_privateKey, 'hex'), { data: _dataToSign });
    },
    recoverTypedSignature_v4: function (dataToSign, signature) {
        return sigUtil.recoverTypedSignature({
            data: dataToSign,
            sig: signature
        });
    },
    executeMetaTransferOn: function (contractInstance, params, opts = {}) {
        return contractInstance.contract.methods
                .executeMetaTransfer(...params)
                .send(...opts);
    }
    
}
