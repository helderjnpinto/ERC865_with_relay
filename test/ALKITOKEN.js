var chai = require('chai');

const {
    ether,
    BN, // Big Number support
    send,
    balance
    // constants, // Common constants, like the zero address and largest integers
    // expectEvent, // Assertions for emitted events
    // expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

var bnChai = require('bn-chai');
chai.use(bnChai(BN));
const { assert } = require('chai');

const AlkiToken = artifacts.require("ALKITOKEN");

const metaTransfer = require("../utils/index");

contract("AlkiToken", accounts => {
    const [owner, relayer] = accounts;

    const bob = accounts[8];
    const alice = accounts[9];

    let alki = undefined;

    before(async () => {
        alki = await AlkiToken.deployed();
        console.log("Alki", alki.address)
    });


    it('Should have initialValue of owner', async () => {
        const _balance = await alki.balanceOf(owner);
        const expectedBalance = ether('100');
        console.log("\n OwnerBalance", _balance.toString())
        expect(_balance.gt(expectedBalance)).to.be.true;
    });


    it('Bob and alice need to have zero balance', async () => {
        const bobBalance = await balance.current(bob);
        console.log("bobBalance", bobBalance.toString())
        
        const aliceBalance = await balance.current(alice);
        console.log("aliceBalance", aliceBalance.toString())

        if (bobBalance.toString() !== "0") {
            await send.ether(bob, owner, bobBalance.toString());
        }

        if (aliceBalance.toString() !== "0") {
            await send.ether(alice, owner, aliceBalance.toString());
        }
    })


    it('Owner Should transfer 1000 tokens to bob if balance is zero', async () => {
        if ((await alki.balanceOf(bob)).toString() === "0") {
            const { tx, receipt } = await alki.transfer(bob, 1000, {
                from: owner
            })
            console.log("tx", tx)
            assert.ok(receipt.status);
        } else {
            assert.ok(true);
        }
    })


    it('Bob balance is bigger than 1', async function() {
        const _balance = await alki.balanceOf(bob);
        console.log("balance", _balance.toString())
        const expectedBalance = ether("1");
        expect(_balance.gt(expectedBalance)).to.be.true;
    })


    it('Bob sign transaction to relayer sending 10 tokens for alice giving 1 of fee', async () => {
        let nonce = await alki.getNonce(bob);
        console.log("nonce", nonce)

        const metaTx = metaTransfer.encodeMetaTransfer(
            bob,
            alice,
            10,
            1,
            nonce
        )
        console.log("metaTx", metaTx)

        const encodedDataToSign = metaTransfer.encodeDataToSign(metaTx, alki.address)
        console.log("encodedDataToSign", encodedDataToSign)
      
    })


});