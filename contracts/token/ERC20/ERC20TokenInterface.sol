pragma solidity ^0.4.23;


/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20TokenInterface{
  function allowance(address owner, address spender) external view returns (uint);
  function transferFrom(address from, address to, uint value) external returns (bool);
  function approve(address spender, uint value) external returns (bool);
  function totalSupply() external view returns (uint);
  function balanceOf(address who) external view returns (uint);
  function transfer(address to, uint value) external returns (bool);
  
  event Transfer(address indexed from, address indexed to, uint value);
  event Approval(address indexed owner, address indexed spender, uint value);
}
