pragma solidity ^0.4.23;


library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    require(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a / b;
    return c;
  }

  /**
  * @dev Substracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a);
    return c;
  }
}


/**
 * @title Standard token with dividends distribution support
 */
contract ERC20DividendsTokenFull{

  using SafeMath for uint;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event ReleaseDividendsRights(address indexed _for, uint256 value);
  event AcceptDividends(uint256 value);




  uint constant DECIMAL_MULTIPLIER = 10 ** 18;
  uint constant INT256_MAX = 1 << 255 - 1;

  mapping (address => uint) balances;
  mapping (address => uint) dividendsRightsFix;
  mapping (address => mapping (address => uint)) internal allowed;


  uint totalSupply_;
  uint dividendsPerToken;
 

  /**
  * @dev Gets the dividends rights of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount of dividends rights owned by the passed address.
  */
  function dividendsRightsOf(address _owner) public view returns (uint balance) {
    uint rights = dividendsPerToken * balances[_owner] / DECIMAL_MULTIPLIER + dividendsRightsFix[_owner];
    return int(rights) < 0 ? 0 : rights;
  }



  /**
  * @dev release dividends rights
  * @param _value The amount of dividends to be transferred.
  * @param _for The address to transfer for.
  */
  function releaseDividendsRights_(address _for, uint _value) internal returns(bool) {
    uint _dividendsRights = dividendsRightsOf(_for);
    require(_dividendsRights >= _value);
    dividendsRightsFix[_for] -= _value;
    msg.sender.transfer(_value);
    emit ReleaseDividendsRights(_for, _value);
    return true;
  }


  /**
  * @dev release dividends rights
  * @param _value The amount of dividends to be transferred.
  */
  function releaseDividendsRights(uint _value) public returns(bool) {
    return releaseDividendsRights_(msg.sender, _value);
  }


  /**
  * @dev total number of tokens in existence
  */
  function totalSupply() public view returns (uint) {
    return totalSupply_;
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
   * @dev Update dividends rights fix
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amount of tokens to be transferred
   */
  function dividendsRightsFixUpdate_(address _from, address _to, uint _value) private {
    uint _dividendsPerToken = dividendsPerToken;
    uint _balanceFrom = balances[_from];
    uint _balanceTo = balances[_to];
    dividendsRightsFix[_from] += _dividendsPerToken * _balanceFrom / DECIMAL_MULTIPLIER - _dividendsPerToken * (_balanceFrom - _value) / DECIMAL_MULTIPLIER;
    dividendsRightsFix[_to] += _dividendsPerToken * _balanceTo / DECIMAL_MULTIPLIER - _dividendsPerToken * (_balanceTo + _value) / DECIMAL_MULTIPLIER; 
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value The amount of tokens to be transferred
   */
  function transfer_(address _from, address _to, uint _value) internal returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);
    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Transfer tokens from one address to another, decreasing allowance
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value The amount of tokens to be transferred
   */
  function transferAllowed_(address _from, address _to, uint _value) internal returns (bool) {
    uint _allowed = allowed[_from][msg.sender];
    require(_value <= _allowed);
    allowed[_from][msg.sender] = _allowed.sub(_value);
    return transfer_(_from, _to, _value);
  }


  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint _value) public returns (bool) {
    dividendsRightsFixUpdate_(msg.sender, _to, _value);
    return transfer_(msg.sender, _to, _value);
  }


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint _value) public returns (bool) {
    dividendsRightsFixUpdate_(_from, _to, _value);
    return transferAllowed_(_from, _to, _value);
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
    uint _allowed = allowed[msg.sender][_spender];
    _allowed = _allowed.add(_addedValue);
    allowed[msg.sender][_spender] = _allowed;
    emit Approval(msg.sender, _spender, _allowed);
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
    uint _allowed = allowed[msg.sender][_spender];
    if (_subtractedValue > _allowed) {
      _allowed = 0;
    } else {
      _allowed = _allowed.sub(_subtractedValue);
    }
    allowed[msg.sender][_spender] = _allowed;
    emit Approval(msg.sender, _spender, _allowed);
    return true;
  }

  
  /**
   * @dev Accept dividends 
   */
  function () public payable {
    uint _dividendsPerToken = dividendsPerToken;
    uint _totalSupply = totalSupply_;
    require(_totalSupply > 0);
    _dividendsPerToken = _dividendsPerToken.add(msg.value.mul(DECIMAL_MULTIPLIER)/_totalSupply);
    require(_dividendsPerToken.mul(_totalSupply) <= INT256_MAX);
    dividendsPerToken = _dividendsPerToken;
    emit AcceptDividends(msg.value);
  }

}
