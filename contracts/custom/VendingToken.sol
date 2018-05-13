pragma solidity ^0.4.23;
import "../token/ERC20/ERC20DividendsToken.sol";
import "../ownership/Ownable.sol";

contract VendingToken is ERC20DividendsToken, Ownable {
  uint constant DECIMAL_MULTIPLIER = 10 ** 18;
  string public name = "Vending Token";
  string public symbol = "VEND";
  uint8 public decimals = 18;

  /**
  * @dev release dividends rights for a specified address
  * @param _for The address to transfer for.
  * @param _value The amount of dividends to be transferred.
  */
  function releaseDividendsRightsForce(address _for, uint _value) external onlyOwner returns(bool) {
    return releaseDividendsRights_(_for, _value);
  }

  constructor() public {
    uint _totalSupply = 100 * DECIMAL_MULTIPLIER;
    totalSupply_ = _totalSupply;
    balances[owner] = _totalSupply;
    emit Transfer(address(0), owner, _totalSupply);
  }
}