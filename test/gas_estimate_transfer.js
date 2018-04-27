



var ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
var StandardDividendsToken = artifacts.require("./StandardDividendsToken.sol");
var V2Token = artifacts.require("./V2Token.sol");
var VendingToken = artifacts.require("./VendingToken.sol");


const _tokens_to_transfer = 5 * 10**18;

contract('VendingToken (from ERC20DividendsToken)', (accounts) => {

    it("Should deploy and transfer", async () => {
        let instance = await VendingToken.new();
        let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
        console.log(`VendingToken deploy gas cost: ${receipt.gasUsed}`);

        let tx = await instance.transfer(accounts[1], _tokens_to_transfer);

        console.log(`VendingToken transfer gas cost: ${tx.receipt.gasUsed}`);

    });
});

contract('V2Token (from StandardDividendsToken)', (accounts) => {

    it("Should deploy and transfer", async () => {

        let instance = await V2Token.new();
        let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
        console.log(`V2Token deploy gas cost: ${receipt.gasUsed}`);

        let tx = await instance.transfer(accounts[1], _tokens_to_transfer);

        console.log(`V2Token transfer gas cost: ${tx.receipt.gasUsed}`);
    });
});

