pragma solidity ^0.4.21;
import "../token/ERC20/StandardDividendsToken.sol";

contract V2Token is StandardDividendsToken {

  uint constant DECIMAL_MULTIPLIER = 10 ** 18;
  string public name = "Vending Token 2";
  string public symbol = "VEND2";
  uint8 public decimals = 18;

  function V2Token() public {
    totalSupply_ = 100 * DECIMAL_MULTIPLIER;
    balances[owner] = totalSupply_;
    emit Transfer(address(0), owner, totalSupply_);
  }
}