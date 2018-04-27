pragma solidity ^0.4.21;

import "../../../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Standard token with dividends distribution support
 */
contract StandardDividendsToken is StandardToken, Ownable {

  using SafeMath for uint;

  mapping (address => uint) public dividendsRightsFix;

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

  function getDRF (address user) public view returns(uint v) {
    return dividendsRightsFix[user];
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

    address _from = msg.sender;

    uint dr_from = dividendsRightsOf(_from);
    uint dr_to   = dividendsRightsOf(_to);

    super.transfer(_to, _value);

    dividendsRightsFix[_from] += dr_from - dividendsRightsOf(_from);
    dividendsRightsFix[_to] += dr_to - dividendsRightsOf(_to);

    return true;
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint _value) public returns (bool) {

    uint dr_from = dividendsRightsOf(_from);
    uint dr_to   = dividendsRightsOf(_to);

    super.transferFrom(_from, _to, _value);

    dividendsRightsFix[_from] += dr_from - dividendsRightsOf(_from);
    dividendsRightsFix[_to] += dr_to - dividendsRightsOf(_to);

    return true;
  }


  /**
   * @dev Accept dividends
   */
  function () public payable {
    totalAcceptedDividends += msg.value;
  }

}
