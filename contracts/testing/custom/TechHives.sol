pragma solidity ^0.4.23;
import "../../abstract/ERC20/ERC20Sec.sol";
import "../../libs/math/SafeMath.sol";
import "../../libs/ownership/MultiOwnable.sol";
import "../../abstract/Cassette/EtherCassette.sol";

contract TechHives is ERC20Sec, EtherCassette, MultiOwnable {
  using SafeMath for uint;
  uint constant DECIMAL_MULTIPLIER = 10 ** 18;
  string public name = "TechHives";
  string public symbol = "THV";
  uint8 public decimals = 18;

  uint mintSupply_;

  /**
  * @dev release dividends rights for a specified address
  * @param _for The address to transfer for.
  * @param _value The amount of dividends to be transferred.
  */
  function releaseDividendsRightsForce(address _for, uint _value) external onlyOwner returns(bool) {
    return releaseDividendsRights_(_for, _value);
  }

  function dividendsRightsFixUpdate_(address _for, uint _value) private {
    uint _dividendsPerToken = dividendsPerToken;
    uint _balanceFor = balances[_for];
    dividendsRightsFix[_for] += _dividendsPerToken * _balanceFor / DECIMAL_MULTIPLIER - 
      _dividendsPerToken * (_balanceFor + _value) / DECIMAL_MULTIPLIER; 
  }
  
  function mint_(address _for, uint _value) internal returns(bool) {
    require (mintSupply_ >= _value);
    dividendsRightsFixUpdate_(_for, _value);
    mintSupply_ = mintSupply_.sub(_value);
    balances[_for] = balances[_for].add(_value);
    totalSupply_ = totalSupply_.add(_value);
    emit Transfer(address(0), _for, _value);
    return true;
  }

  function mint(address _for, uint _value) external onlyOwner returns(bool) {
    return mint_(_for, _value);
  }
  
  
  function mintSupply() external view returns(uint) {
      return mintSupply_;
  }

  constructor() public {
    mintSupply_ = 25000 * DECIMAL_MULTIPLIER;
    addOwner_(0x47FC2e245b983A92EB3359F06E31F34B107B6EF6);
    addOwner_(msg.sender);
  }
}