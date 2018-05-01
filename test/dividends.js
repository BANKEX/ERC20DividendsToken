

var V2Token = artifacts.require("./V2Token.sol");
var VendingToken = artifacts.require("./VendingToken.sol");



const tw = web3._extend.utils.toWei
const fw = v=>web3._extend.utils.fromWei(v).toString()

const dividends_value = tw(3); //eth


contract('V2Token (from StandardDividendsToken)', (accounts) => {

    const host  = accounts[0]
    const alice = accounts[1]
    const bob   = accounts[2]
    const carl  = accounts[3]

    it("Should pay dividents", async () => {

        let v = await V2Token.new();

        v.transfer(alice, tw(33))
        v.transfer(bob, tw(66))

        await v.sendTransaction({value: dividends_value, from: carl});

        let divs_alice = await v.dividendsRightsOf(alice)

        let divs_bob = await v.dividendsRightsOf(bob)


        v.transfer(alice, tw(10), {from: bob} )

        let divs_bob2 = await v.dividendsRightsOf(bob)
        let divs_alice2 = await v.dividendsRightsOf(alice)

        assert.equal(fw(divs_bob), fw(divs_bob2));
        assert.equal(fw(divs_alice), fw(divs_alice2));
        
    })

})
