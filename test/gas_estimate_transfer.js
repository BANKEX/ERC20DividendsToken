/*
var V2Token = artifacts.require("./V2Token.sol");
var VendingToken = artifacts.require("./VendingToken.sol");


const _tokens_to_transfer = 5 * 10**18;

contract('VendingToken (from ERC20DividendsTokenFull)', (accounts) => {

    it("Should deploy and transfer", async () => {
        let instance = await VendingToken.new();
        let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
        console.log(`VendingToken deploy gas cost: ${receipt.gasUsed}`);

        let tx = await instance.transfer(accounts[1], _tokens_to_transfer);

        console.log(`VendingToken transfer gas cost: ${tx.receipt.gasUsed}`);

        await instance.approve(accounts[1], 100000);

        tx = await instance.transferFrom(accounts[0], accounts[2], 9000, {from: accounts[1]});

        console.log(`VendingToken transferFrom gas cost: ${tx.receipt.gasUsed}`);
    });
});

contract('V2Token (from ERC20DividendsToken)', (accounts) => {

    const host  = accounts[0]
    const alice = accounts[1]
    const bob   = accounts[2]

    it("Should deploy and transfer", async () => {

        let instance = await V2Token.new();
        let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
        console.log(`V2Token deploy gas cost: ${receipt.gasUsed}`);

        let tx = await instance.transfer(accounts[1], _tokens_to_transfer);

        console.log(`V2Token transfer gas cost: ${tx.receipt.gasUsed}`);


        await instance.approve(alice, 100000);

        tx = await instance.transferFrom(host, bob, 90000, {from: alice})

        console.log(`VendingToken transferFrom gas cost: ${tx.receipt.gasUsed}`);
    });
});

*/