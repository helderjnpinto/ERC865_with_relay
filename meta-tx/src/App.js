import React from 'react'
import './App.css'
import Biconomy from "@biconomy/mexa";

const abi = require("./ERC20.json").abi;
const Web3 = require("web3");
const sigUtil = require("eth-sig-util");

// AlkiToken contract address

const contractAddress = "0x62108c6Ca558842ebb7CDb085c04cE3139038900";
const biconomyAPIKey = 'Nh4v1BBUg.cc47f7ac-a66f-49b2-9670-f2e07d8b95e9'; // Biconomy api key from the dashboard  

const parentChainId = '80001'; // chain id of the network 
console.log("parentChainId", parentChainId)
const maticProvider = 'https://rpc-mumbai.matic.today/';

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
    console.log("error ethereum", error)
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
const recipient = "0xd877CbFa468314e46115582cc450e780cBCD4aBb"; // account 14

const metaTransfer = async () => {
    let functionSignature = contract.methods
        .transfer(recipient, amount)
        .encodeABI();
        console.log("functionSignature", functionSignature)
    executeMetaTransaction(functionSignature);
};


const executeMetaTransaction = async functionSignature => {
    const accounts = await web3.eth.getAccounts();
    console.log("accounts", accounts)
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
    web3.eth.currentProvider.sendAsync({
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
            
            console.log("recovered", recovered)
            
            let tx = contract.methods
                .executeMetaTransaction(userAddress, functionSignature,
                    r, s, v)
                .send({
                    from: userAddress
                });
            
            console.log("tx", tx)
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
