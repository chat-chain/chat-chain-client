// SPDX-License-Identifier: MIT
import "./Landable.sol";
pragma solidity >=0.4.21 <0.9.0;


contract Recipiant is Landable(){
  
  address _domainHashAdd;
  uint postCounter;
  bool _freePost;



  constructor(string memory first_post, address domainHashAdd , address firstComContract, uint firstComIndex , address eveeContract){
    _tokenId = firstComIndex;
    _NFTContract = firstComContract;
    _freePost = true;
    whiteListEvee(eveeContract);
    changedomainHashAdd (domainHashAdd);
    post(first_post,0);
  }
  
  event post_com(uint indexed id, address indexed NFTContract , uint indexed tokenId, bool freePost);
  event post_msg(uint indexed id, uint indexed prev ,string body, address indexed sender);



  function post(string memory input, uint prev) public {
    require (prev < postCounter || prev == 0, 'commenting on non-existing post');
    if (_sender == address(0)) {
      _sender = msg.sender;
    }
    emit post_com(postCounter, _NFTContract, _tokenId, _freePost);
    emit post_msg(postCounter,prev, input, _sender);

    postCounter ++;
  } 

  function encodeEip712DomainHash() notLandable() public override returns (bytes32){
      require (_domainHashAdd!= address(0), "domainHashAdd was not initated");
      (bool success, bytes memory hash) = _domainHashAdd.delegatecall(
              abi.encodeWithSignature(string('delEncodeEip712DomainHash(address)'),address(this)));
      require(success, string(abi.encodePacked("Failed to delegatecall encodeEip712DomainHash")));
      return bytes32(hash);
   
  
  }
  function changedomainHashAdd (address domainHashAdd) public notLandable() onlyOwner(){
      _domainHashAdd = domainHashAdd;
  }

}
