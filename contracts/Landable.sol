// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract Landable {
  //@dev delegate call on self is allways safe because:
  //  1. you cannot run internal function via delegatecall
  //  2. only code for self can be executed (no malicious functions)

  address private _owner;
  uint    _tokenId;
  address _NFTContract;
  uint    _prev;
  address _sender;
  address _comSender;
  bool    _freeTx;
  mapping (address => bool) _approvedEveeContacts;

  constructor(){
    _owner = msg.sender;
  }

  modifier notLandable() {
    require (_freeTx == false, 'this function is not landable');
    _;
  }

  modifier isWhiteListedEvee() {
    require (_approvedEveeContacts[msg.sender] == true, 'not in whitelist');
    _;
  }

   modifier onlyOwner() 
  {
    require(isOwner(),"Function accessible only by the owner");
    _;
  }

  function isOwner() notLandable() public view returns(bool) 
  {
    return msg.sender == _owner;
  }
 
  function land (bytes memory senderTxData, uint tokenId, address NFTContract, address sender) notLandable() virtual public {
    _freeTx = true;
    _tokenId = tokenId;
    _sender = sender;
    _NFTContract = NFTContract;
    (bool didSucceed, bytes memory returnData) = address(this).delegatecall(senderTxData);
    require(didSucceed, string(abi.encodePacked(abi.encodePacked("Failed to execute Free TX ",address(this), string(senderTxData)))));
    _tokenId = 0;
    _NFTContract = address(0);
    _freeTx = false;
    _sender = address(0);
  }
  function encodeEip712DomainHash () public virtual returns (bytes32){
    return ("");
  }



  function whiteListEvee  (address eveeContract) public notLandable() onlyOwner() {
    _approvedEveeContacts[eveeContract] = true;
  }

  function blackListEvee(address eveeContract) public notLandable() onlyOwner() {
    _approvedEveeContacts[eveeContract] = false;
  }

}