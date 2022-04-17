// SPDX-License-Identifier: MIT
import "./Landable.sol";
pragma solidity >=0.4.21 <0.9.0;


contract Test is Landable(){
  

  uint postCounter;
  address _domainHashAdd;

  constructor( address domainHashAdd ,address eveeContract){
    whiteListEvee(eveeContract);
    changedomainHashAdd (domainHashAdd);
  }
  
  event comTest(uint num);

  function test(uint num) public {
    postCounter = num;
    emit comTest(num);
  } 

  
  function encodeEip712DomainHash() public override returns (bytes32){
      require (_domainHashAdd!= address(0), "domainHashAdd was not initated");
      (bool success, bytes memory hash) = _domainHashAdd.delegatecall(
              abi.encodeWithSignature(string('delEncodeEip712DomainHash(address)'),address(this)));
      require(success, string(abi.encodePacked("Failed to delegatecall encodeEip712DomainHash")));
      return bytes32(hash);
   
  
  }
  function changedomainHashAdd (address domainHashAdd) public onlyOwner(){
      _domainHashAdd = domainHashAdd;
  }

}
