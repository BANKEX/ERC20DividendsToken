pragma solidity ^0.4.21;

import "./BasicToken.sol";
import "./ERC20.sol";
import "../../ownership/Ownable.sol";

/**
 * @title Standard ERC20 token with dividends distribution support
 */
contract ERC20DividendsToken is ERC20, Ownable {

  using SafeMath for uint;

  mapping (address => uint) balances;
  mapping (address => uint) dividendsRightsFix;
  mapping (address => mapping (address => uint)) internal allowed;


  uint totalSupply_;
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
  * @dev total number of tokens in existence
  */
  function totalSupply() public view returns (uint) {
    return totalSupply_;
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
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint balance) {
    return balances[_owner];
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
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   *
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint specifying the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) public view returns (uint) {
    return allowed[_owner][_spender];
  }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   *
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
  function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
    allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   *
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
  function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
    uint oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue > oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  
  /**
   * @dev Accept dividends 
   */
  function () public payable {
    totalAcceptedDividends += msg.value;
  }

}
