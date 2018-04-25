const VendingToken = artifacts.require("./VendingToken.sol");
// let ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
const web3 = global.web3;

contract('VendingToken', (accounts) => {

    //initial params for testing

    beforeEach(async function() {
        vending = await VendingToken.new();
    });

   

    it("should allow tokenholder to give permission to other account to transfer his tokens", async function() {
        await vending.sendTransaction({ value: 1e+18, from: accounts[8]});
        await vending.dividendsRightsOf(accounts[0]);
        let rightsBefore = (await vending.dividendsRightsOf(accounts[2])).toNumber();
        await vending.approve(accounts[1], 100000, {from: accounts[0]});
        await vending.transferFrom((accounts[0]).toString(), (accounts[2]).toString(), 9000, {from: (accounts[1]).toString() });
        await vending.sendTransaction({ value: 1e+18, from: accounts[8]});
        let rightsAfter = (await vending.dividendsRightsOf(accounts[2])).toNumber();
        assert.notEqual(rightsBefore, rightsAfter);
    })


    it("should return that owner is accounts[0]", async function() {
        assert.equal(await vending.owner(), accounts[0]);
    })

    it("should return total balance = 10 ** 20", async function() {
        let good = 10 ** 20;
        let answer = (await vending.balanceOf(accounts[0])).toNumber();
        assert.equal(good, answer);
    })

    it("should allow to approve accounts[1-9]", async function() {
        let good = "true";
        for(let i = 1; i < 9; i++) {
        let answer = (Boolean(await vending.approve(accounts[i], 1000))).toString();
        assert.equal(good, answer);
        }
        
    })

    it("should show that account[1] allowed to tranfer 1000 from account[0]", async function() {
        await vending.approve(accounts[1], 1000);
        let good = 1000;
        let answer = (await vending.allowance(accounts[0], accounts[1])).toNumber();
        assert.equal(good, answer);
    })

    it("should show that account[0] can increase sum which account[1] can transfer", async function() {
        await vending.approve(accounts[1], 1000);
        await vending.increaseApproval(accounts[1], 100);
        let good = 1100;
        let answer = (await vending.allowance(accounts[0], accounts[1])).toNumber();
        assert.equal(good, answer);
    })

    it("should show that account[0] can decrease sum which account[1] can transfer", async function() {
        await vending.approve(accounts[1], 1000);
        await vending.decreaseApproval(accounts[1], 100);
        let good = 900;
        let answer = (await vending.allowance(accounts[0], accounts[1])).toNumber();
        assert.equal(good, answer);
    })

    it("should accept money", async function() {
        await vending.sendTransaction({ value: 1e+18, from: accounts[0] });
        let vendingAddress = await vending.address
        assert.equal(web3.eth.getBalance(vendingAddress).toNumber(), 1e+18)
    })

    it("should calculate dividendsRightsOf properly", async function() {
        await vending.sendTransaction({ value: 1e+18, from: accounts[0] });
        let good = 1000000000000000000;
        let answer = (await vending.dividendsRightsOf(accounts[0])).toNumber();
        assert.equal(good, answer);
    })

    it("should allow investor to get his dividends", async function() {
        let balance = web3.eth.getBalance(accounts[0]).toNumber()
        await vending.sendTransaction({ value: 1e+18, from: accounts[3] });
        await vending.dividendsRightsOf(accounts[0]);
        await vending.releaseDividendsRights(1000000000000000000);
        assert.notEqual(web3.eth.getBalance(accounts[0]).toNumber(), balance)
    })

    it("should allow investor to get ALL his dividends", async function() {
        let balance = web3.eth.getBalance(accounts[0]).toNumber()
        await vending.sendTransaction({ value: 1e+18, from: accounts[5] });
        let divs = (await vending.dividendsRightsOf(accounts[0])).toNumber();
        await vending.releaseDividendsRights(divs);
        assert.equal((web3.eth.getBalance(accounts[0]).toString()).substring(0,2), ((balance + divs).toString()).substring(0,2))
    })

    it("should allow admin to send dividents of investor by force", async function() {
        let balance = web3.eth.getBalance(accounts[0]).toNumber()
        await vending.sendTransaction({ value: 1e+18, from: accounts[3] });
        let divs = (await vending.dividendsRightsOf(accounts[0])).toNumber();
        await vending.releaseDividendsRightsForce(accounts[0], divs)
        let balanceNew = web3.eth.getBalance(accounts[0]).toNumber()
        assert.notEqual(balanceNew, balance);
    })

    it("should allow tokenholder to send his tokens to other account && this new token holder can get dividends from new accepted ETH", async function() {
        await vending.sendTransaction({ value: 2e+18, from: accounts[1]});
        let dividentsOfHolder = (await vending.dividendsRightsOf(accounts[0])).toNumber();
        let balanceOfTokenHolder = (await vending.balanceOf(accounts[0])).toNumber();
        let balanceOfNewHolder = (await vending.balanceOf(accounts[2])).toNumber();
        let dividendsOfNewHolder = (await vending.dividendsRightsOf(accounts[2])).toNumber();
        await vending.transfer(accounts[2], balanceOfTokenHolder);
        await vending.sendTransaction({ value: 2e+18, from: accounts[5]});
        let balanceOfNewHolderAfterTransfer = (await vending.balanceOf(accounts[2])).toNumber()
        let dividendsOfNewHolderAfterTransfer = (await vending.dividendsRightsOf(accounts[2])).toNumber();
        assert.equal(((dividendsOfNewHolderAfterTransfer).toString()).substring(0,4), ((dividendsOfNewHolder + dividentsOfHolder).toString()).substring(0,4), "dividents problem")
        assert.equal(balanceOfNewHolderAfterTransfer, balanceOfNewHolder + balanceOfTokenHolder);
        assert.notEqual(balanceOfNewHolderAfterTransfer, balanceOfNewHolder);
        assert.notEqual(dividendsOfNewHolderAfterTransfer, dividendsOfNewHolder)
    })

    it("should allow tokenholder to send his tokens to other accounts", async function() {
        for (let i = 1; i < 7; i++) {
            await vending.sendTransaction({ value: 2e+18, from: accounts[9]});
            let balances = (await vending.balanceOf(accounts[i])).toNumber();
            let rightsOfAcc = (await vending.dividendsRightsOf(accounts[i])).toNumber();
            let balance = (await vending.balanceOf(accounts[0])).toNumber();
            let dividendsOfHolder = (await vending.dividendsRightsOf(accounts[0])).toNumber();
            await vending.transfer(accounts[i], balance / 10);
            await vending.sendTransaction({ value: 1e+18, from: accounts[9]});
            let balancesNew = (await vending.balanceOf(accounts[i])).toNumber();
            let newRigths = (await vending.dividendsRightsOf(accounts[i])).toNumber();
            assert.notEqual(rightsOfAcc, newRigths);
        }
    })
    it("should allow owner to decrease aproval of account", async function(){
        await vending.sendTransaction({ value: 2e+18, from: accounts[7]});
        await vending.approve(accounts[1], 10000, {from: accounts[0]});
        let balanceBefore = (await vending.allowance(accounts[0], accounts[1])).toNumber();
        await vending.decreaseApproval(accounts[1], 1000, {from: accounts[0]});
        let balanceAfter = (await vending.allowance(accounts[0], accounts[1])).toNumber();
        assert.notEqual(balanceAfter, balanceBefore);
        assert.equal(balanceAfter + 1000, balanceBefore);
    })
    it("should allow owner to increase aproval of account", async function(){
        await vending.sendTransaction({ value: 2e+18, from: accounts[7]});
        await vending.approve(accounts[1], 10000, {from: accounts[0]});
        let balanceBefore = (await vending.allowance(accounts[0], accounts[1])).toNumber();
        await vending.increaseApproval(accounts[1], 1000, {from: accounts[0]});
        let balanceAfter = (await vending.allowance(accounts[0], accounts[1])).toNumber();
        assert.notEqual(balanceAfter, balanceBefore);
        assert.equal(balanceAfter - 1000, balanceBefore);
    })

    it("should make all economic circle", async function(){
        
    })

});
