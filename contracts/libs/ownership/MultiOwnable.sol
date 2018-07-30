pragma solidity ^0.4.23;


contract MultiOwnable{

  mapping(address => bool) public owners;
  uint internal ownersLength_;

  modifier onlyOwner() {
    require(owners[msg.sender]);
    _;
  }
  
  event AddOwner(address indexed sender, address indexed owner);
  event RemoveOwner(address indexed sender, address indexed owner);

  function addOwner_(address _for) internal returns(bool) {
    if(!owners[_for]) {
      ownersLength_ += 1;
      owners[_for] = true;
      emit AddOwner(msg.sender, _for);
      return true;
    }
    return false;
  }

  function addOwner(address _for) onlyOwner external returns(bool) {
    return addOwner_(_for);
  }

  function removeOwner_(address _for) internal returns(bool) {
    if((owners[_for]) && (ownersLength_ > 1)){
      ownersLength_ -= 1;
      owners[_for] = false;
      emit RemoveOwner(msg.sender, _for);
      return true;
    }
    return false;
  }

  function removeOwner(address _for) onlyOwner external returns(bool) {
    return removeOwner_(_for);
  }

}