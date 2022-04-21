import React, { Component } from 'react'
import { Bid } from './Bid'
import getPosts from '../../getPosts'

const masterProxy = '0xf38232721553a3dfa5F7c0E473c6A439CD776038';
export class Commercial extends Component {
  constructor(props) {
    super(props)

    this.state = {
      uri: '',
      flag: false,
      userBidPerCom: '',
      comCount: '',
    }
  }

  handleInputChange = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }

  onSendCommercial = async () => {
    const { accounts, eveeContract, recipiantContract } = this.props
    const { uri, userBidPerCom, comCount } = this.state
    const contract_of_remote = await recipiantContract._address
    console.log('BID', parseInt(userBidPerCom))
    await eveeContract.methods
      .acceptComercial(masterProxy, contract_of_remote, uri, comCount)
      .send({ from: accounts[0], gasLimit: 6000000, value: parseInt(userBidPerCom) * parseInt(comCount)})

    /* testing of no TXData code
    await eveeContract.methods
      .acceptComercial(address, contract_of_remote, uri)
      .send({ from: accounts[0], gasLimit: 6000000, value: 90000000000000000 })
    */
  }

  getMyPendingCommercials = async () => {
    const { accounts , recipiantContract } = this.props
    var filter = { owner: accounts[0], _attachFrom: masterProxy , _attachTo: await recipiantContract._address}
    const allEvents = await this.getCommercials(filter)
    console.log('Commercials Events',allEvents)
    var currentActiveComs = {}
    for (var event of allEvents){
      if (event['created_consumed_'] == true){
        event['maxComCount'] = event['currentComCount'];
        currentActiveComs[event['id']] = event;
      }
      else if (event['currentComCount'] > 0 ){
        currentActiveComs[event['id']]['currentComCount'] = event['currentComCount']
      }
      else if( event['is_active'] == false ){
        delete currentActiveComs[event['id']];
      }
    }  
    console.log('Pending Commercials',currentActiveComs)
  }


  getCommercials = async (filter) => {
    const {  eveeContract } = this.props
    //const contract_of_remote = await recipiantContract._address
    //		event commercial(address indexed owner , address indexed _attachFrom, address indexed _attachTo, uint balance, string uri, uint comCount ,uint id , bool is_active , bool created_consumed_ , uint nft, address ndtAddress );

    var unused_commercials = 
      await eveeContract.getPastEvents('commercial', {
        filter: filter, // use prev : x to see all x's replies
        fromBlock: 0,
        toBlock: 'latest',
      })
      var myPendingComs = []
      for (var com of unused_commercials){
        var dict = {}
        dict['_attachFrom'] = com.returnValues._attachFrom
        dict['_attachTo'] = com.returnValues._attachTo
        dict['balance'] = com.returnValues.balance
        dict['currentComCount'] = com.returnValues.comCount
        dict['created_consumed_'] = com.returnValues.created_consumed_
        dict['id'] = com.returnValues.id
        dict['is_active'] = com.returnValues.is_active
        dict['owner'] = com.returnValues.owner
        dict['uri'] = com.returnValues.uri
        dict['nft'] = com.returnValues.nft
        dict['nftAddress'] = com.returnValues.nftAddress
        myPendingComs.push(dict)
      }
     return (myPendingComs)

  }

  getTransfers = async (_filter) => {
    const { eveeNFTContract } = this.props
    let events = 
      await eveeNFTContract.getPastEvents('Transfer', {
        filter: _filter, // use prev : x to see all x's replies
        fromBlock: 0,
        toBlock: 'latest',
      })
      let transfers = []
      for (let tr of events){
        let dict = {
          from:tr.returnValues._from,
          to:tr.returnValues._to,
          tokenId:tr.returnValues._tokenId
        }
        transfers.push(dict)
      }
      return transfers

  }

  getComs = async (_filter) => {
    const { recipiantContract } = this.props
    const events = await recipiantContract.getPastEvents(
      'post_com',
      {
        filter: _filter, // use prev : x to see all x's replies
        fromBlock: 0,
        toBlock: 'latest',
      })
      let coms = []
      for (let tr of events){
        let dict = {
          tokenId:tr.returnValues.tokenId,
          id:tr.returnValues.id,
          NFTContract:tr.returnValues.NFTContract
        }
        coms.push(dict)
      }
      return coms
  }


  getMyActiveCommercials = async () => {
    const { accounts , recipiantContract, eveeNFTContract } = this.props
    let filter = { _to: accounts[0],}
    console.log(accounts[0])
    let transfersToMe = await this.getTransfers(filter)
    console.log('Commercials Transfered to me ',transfersToMe)
    let ActiveNFTs = []
    for (let trx of transfersToMe){
      let filter2 = { _tokenId: trx['tokenId'],}
      let history = await this.getTransfers(filter2)
      if (history[history.length - 1]['to'].toUpperCase() == accounts[0].toUpperCase()){
        ActiveNFTs.push(trx)
      }
    }
    console.log('My Active Commercials ',ActiveNFTs)
    let postsWithMyComs = []
    for (let com of ActiveNFTs){
      let postId = await this.getComs( {tokenId: com['tokenId'],NFTContract:await eveeNFTContract._address})
      let post = await getPosts(recipiantContract, eveeNFTContract,{id: postId[postId.length - 1]['id']},)
      postsWithMyComs.push(post[post.length - 1])
    }
    console.log('Account active commercials are: ',postsWithMyComs)
  }

  

  setFlag = () => {
    this.setState({
      flag: true,
    })
  }
  setUserBid = (userBidPerCom) => {
    this.setState({ userBidPerCom })
  }
  setcomCount = (comCount) => {
    this.setState({ comCount })
  }
  render() {
    const { uri, address, flag, userBidPerCom, comCount } = this.state
    const { web3 } = this.props
    //this.getMyPendingCommercials()
    return (
      <>
        <div>
          current commercial address :
          {masterProxy}
        </div>
        <div>
        <button onClick={this.getMyPendingCommercials}>My Pending Commercials</button>
        <button onClick={this.getMyActiveCommercials}>My Active Commercials</button>
        </div>
        <div>
          <label>URI: </label>
          <input
            type="text"
            name="uri"
            value={uri}
            placeholder="uri"
            onChange={this.handleInputChange}
          />
        </div>
        <button onClick={this.setFlag}>next...</button>

        {flag && (
          <Bid
            web3={web3}
            userBidPerCom={userBidPerCom}
            comCount={comCount}
            handleInputChange={this.handleInputChange}
            setUserBid={this.setUserBid}
            setcomCount={this.setcomCount}
            onSendCommercial={this.onSendCommercial}
          />
        )}
      </>
    )
  }
}

export default Commercial
