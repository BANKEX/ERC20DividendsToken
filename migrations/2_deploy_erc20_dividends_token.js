var ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");



module.exports = function(deployer, network, accounts) {
  const operator = accounts[0];
  (async () => {
    await deployer.deploy(ERC20DividendsToken, {"from" : operator});
    let erc20DividendsToken = await ERC20DividendsToken.deployed();

  })();

  
};
