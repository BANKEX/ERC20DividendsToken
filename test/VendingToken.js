var VendingToken = artifacts.require("./VendingToken.sol");

contract('VendingToken', (accounts) => {
    let account1 = accounts[0];
    let account2 = accounts[1];
    let account3 = accounts[2];

    let balanceBeforePayDividendsFromAccount1;
    let balanceBeforePayDividendsFromAccount2;
    let gasUsed;
     
    let meta;

    it("Owner of VendingCotract is the FIRST account", async () => {
        meta= await VendingToken.new();
        assert.equal(await meta.owner(), account1)
    });

    it("Balance of contract creator is 1e+20 VEND", async () => {
        let balance = await meta.balanceOf.call(account1);
        assert.equal(balance.toNumber(), 1e+20);
     });

     it("Should transfer 1e+9 VEND to SECOND account", async () => {
        let isTransfer = await meta.transfer(account2, 1e+9);
        assert.ok(isTransfer);
     });

     it("Balance of SECOND account is 1e+9 VEND", async () => {
        let balance = await meta.balanceOf.call(account2);
        assert.equal(balance.toNumber(), 1e+9);
     });

     it("Third account should send 2 ETH to Smart Contract", async () => {
        let isSend = await meta.sendTransaction({ value: 2e+18, from: account3 })
        assert.ok(isSend);
     });

     it("Should show dividends rights of SECOND account equal to 2e7", async () => {
        let dividends = await meta.dividendsRightsOf(account2);
        assert.equal(dividends.toNumber(), 2e+7);
     });

     it("Should show dividends rights of FIRST account equal to 1.99999999998e+18", async () => {
        let dividends = await meta.dividendsRightsOf(account1);
        assert.equal(dividends.toNumber(), 1.99999999998e+18);
     });

     it("Should show dividends rights of THIRD account equal to 0", async () => {
        let dividends = await meta.dividendsRightsOf(account3);
        assert.equal(dividends.toNumber(), 0);
     });

     it("Should release dividends rights of FIRST account. We will release 6543245 VEND", async () => {
        balanceBeforePayDividendsFromAccount1 = await web3.eth.getBalance(account1);
        let isRealised = await meta.releaseDividendsRights(6543245, {from: account1});
        assert.ok(isRealised);
     });

     it("Should show burned ETH after send 6543245 VEND", async () => {
        let balance = await web3.eth.getBalance(account1);
        gasUsed = balanceBeforePayDividendsFromAccount1 - balance.toNumber() + 6543245;
     });

     it("Should show dividends rights of FIRST account equal to 1999999999973456755", async () => {
        console.log("Burned ETH: " + gasUsed/10e18);
        let dividends = await meta.dividendsRightsOf(account1);
        assert.equal(dividends.toNumber(), 1999999999973456755);
     });

     it("Should release dividends rights of SECOND account. We will release 1.99999999e+7 VEND", async () => {
        balanceBeforePayDividendsFromAccount2 = await web3.eth.getBalance(account2);
        let isRealised = await meta.releaseDividendsRights(1.9999999e+7, {from: account2});
        assert.ok(isRealised);
     });

     it("Should show burned ETH after send 1.9999999e+7 VEND", async () => {
        let balance = await web3.eth.getBalance(account2);
        gasUsed = balanceBeforePayDividendsFromAccount2 - balance.toNumber() + 1.9999999e+7;
       
     });

     it("Should show dividends rights of SECOND account equal to 1", async () => {
        console.log("Burned ETH: " + gasUsed/10e18);
        let dividends = await meta.dividendsRightsOf(account2);
        assert.equal(dividends.toNumber(), 1);
     });

     it("Balances of accounts (in VEND) shouldn't be changed after dividend payment", async () => {
        let balance1 = await meta.balanceOf.call(account1);
        let balance2 = await meta.balanceOf.call(account2);
        let balance3 = await meta.balanceOf.call(account3);
        assert.equal(balance1.toNumber(), 9.9999999999e+19, "The balance of 1-t accoun was changed");
        assert.equal(balance2.toNumber(), 1e+9, "The balance of 3-nd accoun was changed");
        assert.equal(balance3.toNumber(), 0, "The balance of 3-d accoun was changed");
     });
});
