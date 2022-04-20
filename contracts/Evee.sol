pragma solidity >=0.4.21 <0.9.0;

contract Evee 

  {
  	address NFTContract;
	event Log_data(string log);
	event refunded(address to , uint refundAmount);
	event commercial_created(address indexed owner , address indexed _attachFrom, address indexed _attachTo, uint balance,  uint comCount ,uint id );
	event commercial_consumed(address indexed owner , address indexed _attachFrom, address indexed _attachTo, uint balance, uint comCount ,uint id );


	/*NFT - 
	// implement a set uri function and a new transfer that resets uri (or a transfer that requires new uri)
	https://ethereum.stackexchange.com/questions/87853/updating-erc-721-tokens-metadata-after-it-was-minted/87865
	
	https://github.com/nibbstack/erc721/blob/master/src/contracts/mocks/nf-token-metadata-mock.sol
	
	*/
	struct Commercial{
		address attachFrom;
		address attachTo;
		address owner;
		uint 	gweiAmount;
		bool 	isActive;
		string  uri;
		uint 	comCount;
	}
	
	 struct Node {
	    uint256 next;
	    uint256 prev;
	    Commercial com;
	}
	mapping (address => mapping (address => mapping (uint256 => Node)))  commercialsList;
	mapping (address => mapping (address => uint256)) head;
	// check for over flow and empty from the buttom + refound if there's enough monet
	mapping (address => mapping (address => uint256)) idCounter;
	mapping (address => mapping(address => bool)) proxyWhiteList;
	modifier isWhitelisted(address _attFrom, address sender) {
  		if (sender != _attFrom){
			require (proxyWhiteList[_attFrom][sender] == true, 'not in whitelist');
		}
		_;
	}
	
	constructor(address _NFTContract){
    	NFTContract = _NFTContract;
  	}

	function addToWhiteList(address slave) public {
		proxyWhiteList[msg.sender][slave] = true;
	}

	function inWhiteList(address master) public view returns (bool){
		return proxyWhiteList[master][msg.sender] == true;
	}


	function toUint256(bytes memory _bytes)   
	  internal
	  pure
	  returns (uint256 value) {

	    assembly {
	      value := mload(add(_bytes, 0x20))
	    }
	}

		function NFTMint   (address owner, string memory uri) internal returns (uint256)
	{
		bytes memory toeknIdBytes;
		bool success; 
		(success , toeknIdBytes) = NFTContract.call(abi.encodeWithSignature(string('mintNew(address,string)'),owner , uri));
		require(success, string(abi.encodePacked("Failed minting ")));
		return (toUint256(toeknIdBytes));
	}


	function acceptComercial (address _attachFrom, address _attachTo , string memory uri, uint comCount) public payable{
		require (msg.value > 0 , '0 amount was recived. Commercial must have an amount to refound the "free" transaction');
		Commercial memory com = Commercial(_attachFrom, _attachTo, msg.sender, msg.value, true, uri, comCount);
		attachCom( com ,  _attachFrom,  _attachTo );
	}
	
	function attachCom(Commercial memory com , address _attachFrom, address _attachTo ) internal {
		Node memory node = Node (0,idCounter[_attachFrom][_attachTo],com);
		idCounter[_attachFrom][_attachTo] ++;
		commercialsList[_attachFrom][_attachTo][idCounter[_attachFrom][_attachTo]] = node;
		emit commercial_created(com.owner, com.attachFrom, com.attachTo, com.gweiAmount, com.comCount, idCounter[_attachFrom][_attachTo]);
		if (head[_attachFrom][_attachTo] == 0) {
			head[_attachFrom][_attachTo] = idCounter[_attachFrom][_attachTo];
		}
		else{
			commercialsList[_attachFrom][_attachTo][idCounter[_attachFrom][_attachTo] - 1 ].next = idCounter[_attachFrom][_attachTo];
		}
	}


	function deleteCommercial(address attachFrom, address attachTo, uint id) private {
		commercialsList[attachFrom][attachTo][id].com.isActive = false;
		if (head[attachFrom][attachTo] ==id){
			head[attachFrom][attachTo] = commercialsList[attachFrom][attachTo][id].next;
		}
		if (idCounter[attachFrom][attachTo] == id){
			idCounter[attachFrom][attachTo] = commercialsList[attachFrom][attachTo][id].prev;
		}
		if (commercialsList[attachFrom][attachTo][id].prev != 0){
			commercialsList[attachFrom][attachTo][commercialsList[attachFrom][attachTo][id].prev].next = commercialsList[attachFrom][attachTo][id].next;
		}
		if (commercialsList[attachFrom][attachTo][id].next != 0){
			commercialsList[attachFrom][attachTo][commercialsList[attachFrom][attachTo][id].next].prev = commercialsList[attachFrom][attachTo][id].prev;
		}



	}

	function findCommercialArr(address attachFrom ,address attachTo, uint minGas, uint comCount) view public isWhitelisted(attachFrom, msg.sender) returns (uint[] memory){
		uint id = head[attachFrom][attachTo];
		uint [] memory arr = new uint[](comCount);
		uint i = 0;
		while ((id!=0) && (i < comCount-1)){
			require (commercialsList[attachFrom][attachTo][id].com.isActive, 'Linked list is broken, inactive commercial in list of commercials');
			//check if minGas <  amount/comCount
			if ((commercialsList[attachFrom][attachTo][id].com.attachTo == attachTo)&&(commercialsList[attachFrom][attachTo][id].com.attachFrom == attachFrom)&&(commercialsList[attachFrom][attachTo][id].com.gweiAmount/commercialsList[attachFrom][attachTo][id].com.comCount >= minGas)){
				for (uint comAmount = 0; comAmount < commercialsList[attachFrom][attachTo][id].com.comCount ; comAmount++)
				{
					arr[i]=id;
					i++;
					if (i>= comCount-1) break;
				}
			}
			id = commercialsList[attachFrom][attachTo][id].next;
		}
		return arr;
	}

	/*function dumpCommercial(address attachFrom ,address attachTo, uint comCount) view public isWhitelisted(attachFrom, msg.sender) returns (uint[] memory){
		uint id = head[attachFrom][attachTo];
		uint [] memory arr = new uint[](comCount);
		uint i = 0;
		while ((id!=0) && (i < comCount-1)){
			require (commercialsList[attachFrom][attachTo][id].com.isActive, 'Linked list is broken, inactive commercial in list of commercials');
			
			id = commercialsList[attachFrom][attachTo][id].next;
		}
		return arr;
	}*/

	function refund(uint amountRequested) private {
		if (address(this).balance < amountRequested){
			/*
			the require is good for testing, fails if the transaction cost more then the commercial balance.
			in real life I think I can allow it, the loss will be on the proxy for miss calculating the transaction's amount
			*/
			require(false,"Commercial's balance is too low. fatal error");
		}
		payable(msg.sender).transfer(amountRequested);
		emit refunded(msg.sender , amountRequested);
	}


	function consumeCommercial(address attFrom,address remote, uint id) internal isWhitelisted(attFrom, msg.sender) returns (Commercial memory com){
		require (commercialsList[attFrom][remote][id].com.isActive, string(abi.encodePacked('commecial id dont exist',abi.encodePacked(attFrom))));
        com = commercialsList[attFrom][remote][id].com;
	}


	function verifySingerFromSignature(
		  uint8 v,
	    bytes32 r,
	    bytes32 s,
		address sender,
	    address remote,
	    uint256 deadline,
	    bytes memory txData
	    ) 
		internal 
		{
			//bytes memory hashStruct;
			bytes32 hashStruct = keccak256(
		        abi.encode(
		            keccak256("land(bytes txData,address sender,uint deadline)"),
		          	keccak256(txData),
		          	sender,
		          	deadline
		        )
		    );
			(bool success, bytes memory domainHash) = remote.call(abi.encodeWithSignature(string('encodeEip712DomainHash()')));
		    require (success, string(abi.encodePacked("Failed to read EIP712 domain Hash from remoote address ")));
		    bytes32 hash = keccak256(abi.encodePacked("\x19\x01", domainHash, hashStruct));
		    address signer = ecrecover(hash, v, r, s);
		    require(signer == sender, string(abi.encodePacked("invalid signature ", txData)));
		    
		}

	
	function sendMessege(address proxy, address remote,uint id , bytes memory txData, address sender) internal {
			Commercial memory com = consumeCommercial(proxy, remote,id);
			uint256 tokenId = NFTMint(com.owner , com.uri);
			(bool success, ) = remote.call(abi.encodeWithSignature(string('land(bytes,uint256,address,address)'),txData,tokenId,NFTContract,sender));
			require(success, string(abi.encodePacked("Failed call ", string(txData))));
            if (com.comCount == 1){
			    refund(com.gweiAmount); 
                //commercialsList[proxy][remote][id].com.gweiAmount = 0;
                deleteCommercial(proxy, remote, id);
            } else {
                refund(com.gweiAmount / com.comCount);
                commercialsList[proxy][remote][id].com.gweiAmount = com.gweiAmount - (com.gweiAmount / com.comCount);
            }
			emit commercial_consumed(commercialsList[proxy][remote][id].com.owner, commercialsList[proxy][remote][id].com.attachFrom,commercialsList[proxy][remote][id].com.attachTo,commercialsList[proxy][remote][id].com.gweiAmount, commercialsList[proxy][remote][id].com.comCount, id); 
            commercialsList[proxy][remote][id].com.comCount -= 1;
	}

	function freeSendMessege (
		uint8 v,
	    bytes32 r,
	    bytes32 s,
	    address sender,
	    address proxy,
	    address remote,
	    uint256 deadline,
	    bytes memory txData,
	    uint id
		) public isWhitelisted(proxy, msg.sender) {
		  require(sender != address(0), "sender null address");
		  require(block.timestamp < deadline, "Signed transaction expired");
		  require(id != 0, 'id cant be 0');
		  verifySingerFromSignature(v, r, s, sender, remote, deadline, txData);
		  
		  
		  // need to return token ID tokenId
		  sendMessege(proxy,remote, id,txData,sender);
		  
		  
		}
	



	

  	


}