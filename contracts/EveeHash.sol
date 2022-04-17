contract EveeHash {
	function Eip712Hash (
        address sender,
	    uint256 deadline,
	    bytes memory txData) 
        pure public returns (bytes32){
      return (keccak256(
                  abi.encode(
		            keccak256("land(bytes txData,address sender,uint deadline)"),
		          	keccak256(txData),
		          	sender,
		          	deadline
		        )
          )
      );  
  }
}