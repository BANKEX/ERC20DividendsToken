pragma solidity ^0.4.21;

import "./StandardToken.sol";
import "../../ownership/Ownable.sol";

/**
 * @title Standard token with dividends distribution support
 */
contract StandardDividendsToken is StandardToken, Ownable {

  using SafeMath for uint;

  mapping (address => uint) dividendsRightsFix;

  uint totalAcceptedDividends;

  /**
  * @dev Gets the dividends rights of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount of dividends rights owned by the passed address.
  */
  function dividendsRightsOf(address _owner) public view returns (uint balance) {
    return totalAcceptedDividends*balances[_owner]/totalSupply_ + dividendsRightsFix[_owner];
  }

  /**
  * @dev transfer token for a specified address
  * @param _from The address to transfer from.
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function moveBalance(address _from, address _to, uint _value) private {
    require (balances[_from] >= _value);
    uint dividendsRightsFrom = dividendsRightsOf(_from);
    uint dividendsRightsTo = dividendsRightsOf(_to);
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    dividendsRightsFix[_from] += dividendsRightsFrom - dividendsRightsOf(_from);
    dividendsRightsFix[_to] += dividendsRightsTo - dividendsRightsOf(_to);
  }


  /**
  * @dev release dividends rights
  * @param _value The amount of dividends to be transferred.
  */
  function releaseDividendsRights(uint _value) public returns(bool) {
    uint _dividendsRights = dividendsRightsOf(msg.sender);
    require(_dividendsRights >= _value);
    require(int(_dividendsRights) > 0);
    dividendsRightsFix[msg.sender] -= _value;
    msg.sender.transfer(_value);
    return true;
  }

  /**
  * @dev release dividends rights for a specified address
  * @param _for The address to transfer for.
  * @param _value The amount of dividends to be transferred.
  */
  function releaseDividendsRightsForce(address _for, uint _value) public onlyOwner returns(bool) {
    uint _dividendsRights = dividendsRightsOf(_for);
    require(_dividendsRights >= _value);
    require(int(_dividendsRights) > 0);
    dividendsRightsFix[_for] -= _value;
    _for.transfer(_value);
    return true;
  }

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint _value) public returns (bool) {
    require(_to != address(0));

    moveBalance(msg.sender, _to, _value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= allowed[_from][msg.sender]);

    moveBalance(_from, _to, _value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }


  /**
   * @dev Accept dividends
   */
  function () public payable {
    totalAcceptedDividends += msg.value;
  }

}
