pragma solidity ^0.4.24;
import "../../abstract/ERC20/ERC20.sol";
import "../../libs/math/SafeMath.sol";
import "../../libs/ownership/MultiOwnable.sol";


contract TechHives is ERC20, MultiOwnable {
  using SafeMath for uint;
  uint constant DECIMAL_MULTIPLIER = 10 ** 18;
  string public name = "Aitanasecret insta mediatoken utility token";
  string public symbol = "@Aitanasecret_mediatoken";
  uint8 public decimals = 18;

  uint mintSupply_;

  
  function mint_(address _for, uint _value) internal returns(bool) {
    require (mintSupply_ >= _value);
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
    mintSupply_ = 2000 * DECIMAL_MULTIPLIER;
    addOwner_(0x47FC2e245b983A92EB3359F06E31F34B107B6EF6);
    addOwner_(msg.sender);
  }
}