



var ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
var StandardDividendsToken = artifacts.require("./StandardDividendsToken.sol");


const _value = 10**18;
const _tokens_init = 10**6;

contract('ERC20DividendsToken', (accounts) => {

    it("Should deploy", async () => {
        let instance = await ERC20DividendsToken.new();
        let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
        console.log(`ERC20DividendsToken deploy gas cost: ${receipt.gasUsed}`);

        // receipt = await instance.transfer(accounts[0], test_value, {from: accounts[1]});

        // console.log(`ERC20DividendsToken transfer gas cost: ${receipt.gasUsed}`);

    });
});

contract('StandardDividendsToken', (accounts) => {

    it("Should deploy", async () => {

        let instance = await StandardDividendsToken.new();
        let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
        console.log(`StandardDividendsToken deploy gas cost: ${receipt.gasUsed}`);

        await instance.mint(accounts[1], _tokens_init)

        let tx = await instance.transfer(accounts[0], 1, {from: accounts[1]});


        console.log(`StandardDividendsToken transfer gas cost: ${tx.receipt.gasUsed}`);
    });
});

