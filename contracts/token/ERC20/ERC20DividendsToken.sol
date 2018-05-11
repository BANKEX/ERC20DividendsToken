pragma solidity ^0.4.23;



import "../../math/SafeMath.sol";
import "./ERC20Token.sol";
import "./ERC20DividendsTokenInterface.sol";


/**
 * @title Standard token with dividends distribution support
 */
contract ERC20DividendsToken is ERC20DividendsTokenInterface, ERC20Token {
  using SafeMath for uint;

  uint constant DECIMAL_MULTIPLIER = 10 ** 18;
  uint constant INT256_MAX = 1 << 255 - 1;

  mapping (address => uint) internal dividendsRightsFix;
  uint internal dividendsPerToken;

  /**
  * @dev Gets the dividends rights of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount of dividends rights owned by the passed address.
  */
  function dividendsRightsOf(address _owner) external view returns (uint balance) {
    return dividendsRightsOf_(_owner);
  }

  function dividendsRightsOf_(address _owner) internal view returns (uint balance) {
    uint rights = dividendsPerToken * balances[_owner] / DECIMAL_MULTIPLIER + dividendsRightsFix[_owner];
    return int(rights) < 0 ? 0 : rights;
  }


  /**
  * @dev release dividends rights
  * @param _value The amount of dividends to be transferred.
  * @param _for The address to transfer for.
  */
  function releaseDividendsRights_(address _for, uint _value) internal returns(bool) {
    uint _dividendsRights = dividendsRightsOf_(_for);
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
  function releaseDividendsRights(uint _value) external returns(bool) {
    return releaseDividendsRights_(msg.sender, _value);
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
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint _value) external returns (bool) {
    dividendsRightsFixUpdate_(msg.sender, _to, _value);
    return transfer_(msg.sender, _to, _value);
  }


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint _value) external returns (bool) {
    uint _allowed = allowed[_from][msg.sender];
    require(_value <= _allowed);
    allowed[_from][msg.sender] = _allowed.sub(_value);
    dividendsRightsFixUpdate_(_from, _to, _value);
    return transfer_(_from, _to, _value);
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
