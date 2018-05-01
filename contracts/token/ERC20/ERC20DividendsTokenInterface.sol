pragma solidity ^0.4.21;

import "./ERC20TokenInterface.sol";

contract ERC20DividendsTokenInterface is ERC20TokenInterface {
  event ReleaseDividendsRights(address indexed _for, uint256 value);

  function dividendsRightsOf(address _owner) public view returns (uint balance);
  function releaseDividendsRights(uint _value) public returns(bool);
}