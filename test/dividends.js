/*
var V2Token = artifacts.require("./V2Token.sol");
var VendingToken = artifacts.require("./VendingToken.sol");



const tw = web3._extend.utils.toWei
const fw = v=>web3._extend.utils.fromWei(v).toString()


contract('V2Token (from StandardDividendsToken)', (accounts) => {

    const host  = accounts[0]
    const alice = accounts[1]
    const bob   = accounts[2]
    const carl  = accounts[3]

    it("Should pay dividents", async () => {
        const dividends_value = tw("0.1"); 
        const alice_tokens_amount = tw("0.5");
        const bob_tokens_amount = tw("0.3");
        const b2a_transfer_tokens_amount = tw("0.1");

        let v = await V2Token.new();

        v.transfer(alice, alice_tokens_amount)
        v.transfer(bob, bob_tokens_amount)

        await v.sendTransaction({value: dividends_value, from: carl});

        let divs_alice = await v.dividendsRightsOf(alice)

        let divs_bob = await v.dividendsRightsOf(bob)


        v.transfer(alice, b2a_transfer_tokens_amount, {from: bob} )

        let divs_bob2 = await v.dividendsRightsOf(bob)
        let divs_alice2 = await v.dividendsRightsOf(alice)

        assert.equal(fw(divs_bob), fw(divs_bob2));
        assert.equal(fw(divs_alice), fw(divs_alice2));
        
    })

})
*/