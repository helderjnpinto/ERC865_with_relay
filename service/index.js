// src/App.js
import React from "react";
import Biconomy from "@biconomy/mexa";

const abi = require("./AlkiToken.json").abi;
const Web3 = require("web3");
const sigUtil = require("eth-sig-util");

// AlkiToken contract address

const contractAddress = "0xE0C0c684cE66642710AfC4022715CCFd48054e53";
const biconomyAPIKey = 'p7qr8FHuU.e22edc7c-2a7a-41da-8772-6f1eb2f4c384'; // Biconomy api key from the dashboard  

const parentChainId = '3'; // chain id of the network 
const maticProvider = 'https://testnetv3.matic.network';

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
let domainData = {
    name: "AlkiToken",
    version: "1",
    chainId: parentChainId,
    verifyingContract: contractAddress
};

window.ethereum.enable().catch(error => {
    console.log(error);
});
const web3 = new Web3(window.ethereum);
const biconomy = new Biconomy(
    new Web3.providers.HttpProvider(maticProvider), {
        apiKey: biconomyAPIKey,
        debug: true
    }
);
const getWeb3 = new Web3(biconomy);
biconomy
    .onEvent(biconomy.READY, () => {
        console.log("Mexa is Ready");
    })
    .onEvent(biconomy.ERROR, (error, message) => {
        console.error(error);
    });
const contract = new getWeb3.eth.Contract(abi, contractAddress);
const amount = "1000000000000000000";
const recipient = "0xCaE5D611D456CE3650E1b80EC85406371D55Da68";

const metaTransfer = async () => {
    let functionSignature = contract.methods
        .transfer(recipient, amount)
        .encodeABI();
    executeMetaTransaction(functionSignature);
};
const executeMetaTransaction = async functionSignature => {
    const accounts = await web3.eth.getAccounts();
    let userAddress = accounts[0];
    let nonce = await contract.methods.getNonce(userAddress).call();
    let message = {};
    message.nonce = parseInt(nonce);
    message.from = userAddress;
    message.functionSignature = functionSignature;
    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    });
    web3.eth.currentProvider.send({
            jsonrpc: "2.0",
            id: 999999999999,
            method: "eth_signTypedData_v4",
            params: [userAddress, dataToSign]
        },
        function (error, response) {

            let {
                r,
                s,
                v
            } = getSignatureParameters(response.result);

            const recovered = sigUtil.recoverTypedSignature_v4({
                data: JSON.parse(dataToSign),
                sig: response.result
            });
            let tx = contract.methods
                .executeMetaTransaction(userAddress, functionSignature,
                    r, s, v)
                .send({
                    from: userAddress
                });
        }
    );
};
const getSignatureParameters = signature => {
    if (!web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};

function App() {
    return ( <div>
        <h3> AlkiToken </h3>
        <React.Fragment>
            {
            ""
            }
            <button onClick = { () => metaTransfer() }
            size="small">
                Transfer </button>
        </React.Fragment> 
        </div>
    );
}
export default App;
