contract RecipiantHashDomain {
	function delEncodeEip712DomainHash (address verifyer) view public returns (bytes32){
    uint chainId; //= chainId();
      /*assembly {
        chainId := chainid
      }*/
      chainId = 5;
      return keccak256(abi.encode(keccak256(
                  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
              ),
              keccak256(bytes("Evee")),
              keccak256(bytes("1")),
              chainId,
              verifyer
          )
      );  
  }
}