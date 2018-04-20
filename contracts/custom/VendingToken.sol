pragma solidity ^0.4.21;
import "../token/ERC20/ERC20DividendsToken.sol";

contract VendingToken is ERC20DividendsToken {
  uint constant DECIMAL_MULTIPLIER = 10 ** 18;

  function VendingToken() public {
    totalSupply_ = 100;
    balances[owner] = totalSupply_;
    emit Transfer(address(0), owner, totalSupply_);
  }
}