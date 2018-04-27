

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
        // let v = await VendingToken.new();

        v.transfer(alice, tw(33))
        v.transfer(bob, tw(66))

        await v.sendTransaction({value: dividends_value, from: carl});

        let divs_alice = await v.dividendsRightsOf(alice)

        let divs_bob = await v.dividendsRightsOf(bob)

        console.log(fw(divs_bob));
        console.log(fw(divs_alice));


        v.transfer(alice, tw(10), {from: bob} )

        let drf_a = await v.getDRF(alice);
        let drf_b = await v.getDRF(bob);

        console.log(fw(drf_a));
        console.log(fw(drf_b));

        let divs_bob2 = await v.dividendsRightsOf(bob)
        let divs_alice2 = await v.dividendsRightsOf(alice)

        console.log(fw(divs_bob2));
        console.log(fw(divs_alice2));


        // assert.equal((web3.eth.getBalance(accounts[0]).toString()).substring(0,2), ((balance + divs).toString()).substring(0,2))

    })

})