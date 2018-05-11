pragma solidity ^0.4.23;

import "./ERC20TokenInterface.sol";

contract ERC20DividendsTokenInterface is ERC20TokenInterface {
  event ReleaseDividendsRights(address indexed _for, uint256 value);
  event AcceptDividends(uint256 value);

  function dividendsRightsOf(address _owner) external view returns (uint balance);
  function releaseDividendsRights(uint _value) external returns(bool);
}