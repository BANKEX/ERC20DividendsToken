pragma solidity ^0.4.24;

import "./IERC20.sol";

contract IERC20Sec is IERC20 {
  event ReleaseDividendsRights(address indexed _for, uint256 value);
  event AcceptDividends(uint256 value);

  function dividendsRightsOf(address _owner) external view returns (uint balance);
  function releaseDividendsRights(uint _value) external returns(bool);
}