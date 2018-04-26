



var ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
var StandardDividendsToken = artifacts.require("./StandardDividendsToken.sol");

contract('ERC20DividendsToken', (accounts) => {

    it("Should deploy", async () => {
      let instance = await ERC20DividendsToken.new();
      let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
      console.log(`ERC20DividendsToken deploy gas cost: ${receipt.gasUsed}`);
    });
});

contract('StandardDividendsToken', (accounts) => {

    it("Should deploy", async () => {
      let instance = await StandardDividendsToken.new();
      let receipt = await web3.eth.getTransactionReceipt(instance.transactionHash);
      console.log(`StandardDividendsToken deploy gas cost: ${receipt.gasUsed}`);
    });
});

