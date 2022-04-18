import "./tokens/nf-token-metadata.sol";
import "./ownership/ownable.sol";




contract EveeNFT is NFTokenMetadata, Ownable {

  uint public token_counter ;
  mapping (address => bool) minters;
    

  event ChangeUri(
    address indexed _changer,
    string          _from,
    string  indexed _to,
    uint256 indexed _tokenId
  );
	constructor(string memory _uri){
    owner = msg.sender;
    addRemoveMinter(msg.sender, true);
    nftName = 'Evee';
    nftSymbol = 'EVE';
    token_counter = 0;
    mintNew(msg.sender,_uri);
  }

  function addRemoveMinter(address minter, bool addRemove_) public onlyOwner() {
    minters[minter] = addRemove_;
  }

  function mintNew(address _to,string memory _uri) public returns (uint){
    require (minters[msg.sender] , 'Only aproved minter can mint');
    token_counter ++;
    super.mint(_to, token_counter, _uri);
    emit ChangeUri(_to,"",_uri,token_counter);
    return token_counter;  
  }

  function setTokenUri(
    uint256 _tokenId,
    string memory _uri
  )
    external
    canTransfer(_tokenId)
    validNFToken(_tokenId)
  {
    emit ChangeUri(idToOwner[_tokenId],idToUri[_tokenId],_uri,_tokenId);
    super._setTokenUri(_tokenId, _uri);
  }


  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    string calldata _uri
  )
    external
    canTransfer(_tokenId)
    validNFToken(_tokenId)
  {
    address tokenOwner = idToOwner[_tokenId];
    require(tokenOwner == _from, NOT_OWNER);
    require(_to != address(0), ZERO_ADDRESS);
    emit ChangeUri(idToOwner[_tokenId],idToUri[_tokenId],_uri,_tokenId);
    _transfer(_to, _tokenId);
    _setTokenUri(_tokenId, _uri);

  }
  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    string calldata _uri
  )
    external
    canTransfer(_tokenId)
    validNFToken(_tokenId)
  {
    emit ChangeUri(idToOwner[_tokenId],idToUri[_tokenId],_uri,_tokenId);
    super._safeTransferFrom(_from,_to,_tokenId,"");
    _setTokenUri(_tokenId, _uri);
  }

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes calldata _data,
    string calldata _uri

  )
    external
    virtual
  {
    emit ChangeUri(idToOwner[_tokenId],idToUri[_tokenId],_uri,_tokenId);
    super._safeTransferFrom(_from, _to, _tokenId, _data);
    _setTokenUri(_tokenId, _uri);
  }

}
