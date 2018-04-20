const VendingToken = artifacts.require("./VendingToken.sol");
// let ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
const web3 = global.web3;

contract('VendingToken', (accounts) => {

    //Congress initial params for testing
    

    beforeEach(async function() {
        vending = await VendingToken.new();
    });

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

});
