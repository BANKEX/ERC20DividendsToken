var VendingToken = artifacts.require("./VendingToken.sol");



module.exports = function(deployer, network, accounts) {
  const operator = accounts[0];
  (async () => {
    await deployer.deploy(VendingToken, {"from" : operator});
    let vendingToken = await VendingToken.deployed();

  })();
};
