const VendingToken = artifacts.require("./VendingToken.sol");
// let ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
const web3 = global.web3;

const tw = v => web3.toBigNumber(v).mul(1e18);
//const tw = web3._extend.utils.toWei;
const fw = v => web3._extend.utils.fromWei(v).toString();


contract('VendingToken', (accounts) => {

    //initial params for testing

    beforeEach(async function() {
        vending = await VendingToken.new();
    });

    it("should allow tokenholder to give permission to other account to transfer his tokens", async function() {
        let totalSupply = await vending.totalSupply();
        const account2Balance = tw(0.1);
        const etherSent = tw(1);
        await vending.sendTransaction({ value: tw(1), from: accounts[8]});
        await vending.dividendsRightsOf(accounts[0]);
        let rightsBefore = await vending.dividendsRightsOf(accounts[2])
        await vending.approve(accounts[1], tw(0.2), {from: accounts[0]});
        await vending.transferFrom(accounts[0], accounts[2], account2Balance, {from: accounts[1]});
        await vending.sendTransaction({ value: etherSent, from: accounts[8]});
        let rightsAfter = await vending.dividendsRightsOf(accounts[2])
        assert(rightsAfter.minus(rightsBefore).eq(etherSent.mul(account2Balance).divToInt(totalSupply)));
    })


    it("should return that owner is accounts[0]", async function() {
        assert.equal(await vending.owner(), accounts[0]);
    })

    it("should return total balance = 10 ** 20", async function() {
        const good = tw("100");
        let answer = (await vending.balanceOf(accounts[0]))
        assert(good.eq(answer));
    })

    it("should allow to approve accounts[1-9]", async function() {
        let good = tw("0.1");
        for(let i = 1; i < 9; i++) {
            await vending.approve(accounts[i], good);
            answer = await vending.allowance(accounts[0], accounts[i]);
            assert(good.eq(answer));
        }
        
    })

    it("should show that account[1] allowed to tranfer 0.1 from account[0]", async function() {
        const good = tw("0.1");
        await vending.approve(accounts[1], good);
        let answer = await vending.allowance(accounts[0], accounts[1])
        assert(good.eq(answer));
    })

    it("should show that account[0] can increase sum which account[1] can transfer", async function() {
        const allowance1 = tw("0.1");
        const allowance2 = tw("0.01");
        const good = allowance1.plus(allowance2);
        await vending.approve(accounts[1], allowance1);
        await vending.increaseApproval(accounts[1], allowance2);
        let answer = await vending.allowance(accounts[0], accounts[1]);
        assert(good.eq(answer));
    })

    it("should show that account[0] can decrease sum which account[1] can transfer", async function() {
        const allowance1 = tw("0.1");
        const allowance2 = tw("0.01");
        const good = allowance1.minus(allowance2);
        await vending.approve(accounts[1], allowance1);
        await vending.decreaseApproval(accounts[1], allowance2);
        let answer = (await vending.allowance(accounts[0], accounts[1])).toString();
        assert(good.eq(answer));
    })

    it("should accept money", async function() {
        const good = tw("0.1");
        await vending.sendTransaction({ value: good, from: accounts[0] });
        let vendingAddress = await vending.address
        assert(good.eq(web3.eth.getBalance(vendingAddress)))
    })

    it("should calculate dividendsRightsOf properly", async function() {
        const good = tw("0.1");
        await vending.sendTransaction({ value: good, from: accounts[0] });
        let answer = await vending.dividendsRightsOf(accounts[0]);
        assert(good.eq(answer));
    })

    it("should allow investor to get his dividends", async function() {
        const good = tw("0.01");
        const gasPrice = tw("2e-8");
        const transactionAmount = tw("0.1");
        await vending.sendTransaction({ value: transactionAmount, from: accounts[3]});
        await vending.dividendsRightsOf(accounts[0]);
        let balance = web3.eth.getBalance(accounts[0])
        let tx = await vending.releaseDividendsRights(good, {gasPrice: gasPrice});
        let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        assert(web3.eth.getBalance(accounts[0]).minus(balance).plus(gasCost).eq(good))
    })
    

    it("should allow investor to get ALL his dividends", async function() {
        const good = tw("0.1");
        const gasPrice = tw("2e-8");
        await vending.sendTransaction({ value: good, from: accounts[3]});
        await vending.dividendsRightsOf(accounts[0]);
        let balance = web3.eth.getBalance(accounts[0])
        let tx = await vending.releaseDividendsRights(good, {gasPrice: gasPrice});
        let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        assert(web3.eth.getBalance(accounts[0]).minus(balance).plus(gasCost).eq(good))
    })

    it("should allow admin to send dividents of investor by force", async function() {
        const good = tw("0.1");
        const gasPrice = tw("2e-8");
        await vending.sendTransaction({ value: good, from: accounts[3]});
        await vending.dividendsRightsOf(accounts[0]);
        let balance = web3.eth.getBalance(accounts[0])
        let tx = await vending.releaseDividendsRightsForce(accounts[0], good, {gasPrice: gasPrice});
        let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        assert(web3.eth.getBalance(accounts[0]).minus(balance).plus(gasCost).eq(good))

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

    it("should allow tokenholder to send his tokens to other accounts && this new token holders can get dividends from new accepted ETH", async function() {
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
});