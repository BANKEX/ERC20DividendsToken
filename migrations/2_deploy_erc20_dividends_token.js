// var ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");



// module.exports = function(deployer, network, accounts) {
//   const operator = accounts[0];
//   (async () => {
//     await deployer.deploy(ERC20DividendsToken, {"from" : operator});
//     let erc20DividendsToken = await ERC20DividendsToken.deployed();

//   })();

  
// };

var Ownable = artifacts.require("./Ownable.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var BasicToken = artifacts.require("./BasicToken.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var MintableToken = artifacts.require("./MintableToken.sol");
var ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
var VendingToken = artifacts.require("./VendingToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, BasicToken);
  deployer.deploy(BasicToken);
  deployer.link(BasicToken, StandardToken);
  deployer.deploy(StandardToken);
  deployer.link(StandardToken, MintableToken);
  deployer.link(Ownable, MintableToken);
  deployer.deploy(MintableToken);
  deployer.link(StandardToken, ERC20DividendsToken);
  deployer.deploy(ERC20DividendsToken);
  deployer.link(ERC20DividendsToken, VendingToken);
  deployer.deploy(VendingToken);
};