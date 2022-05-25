import React, { Component } from 'react'
import { Bid } from './Bid'
import getPosts from '../../getPosts'
import getEvents from '../../getEvents'
import Web3Context from '../../web3Context'
import { ActiveCommercial } from './ActiveCommercial'
import { PendingCommercial } from './PendingCommercial'
import Ring from '@bit/joshk.react-spinners-css.ring'

const masterProxy = '0xf38232721553a3dfa5F7c0E473c6A439CD776038'
export class Commercial extends Component {
  constructor(props) {
    super(props)

    this.state = {
      uri: '',
      flag: false,
      userBidPerCom: '',
      comCount: '',
      pendingCom: null,
      activeCom: null,
      postUri: '',
      postID: '',
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
  static contextType = Web3Context

  onSendCommercial = async () => {
    // const { accounts, eveeContract, recipiantContract } = this.props
    const { accounts, eveeContract, recipiantContract } = this.context
    const { uri, userBidPerCom, comCount } = this.state
    const contract_of_remote = await recipiantContract._address
    console.log('BID', userBidPerCom)
    await eveeContract.methods
      .acceptComercial(masterProxy, contract_of_remote, uri, comCount)
      .send({
        from: accounts[0],
        gasLimit: 6000000,
        value: parseInt(userBidPerCom) * parseInt(comCount),
      })

    /* testing of no TXData code
    await eveeContract.methods
      .acceptComercial(address, contract_of_remote, uri)
      .send({ from: accounts[0], gasLimit: 6000000, value: 90000000000000000 })
    */
  }

  getMyPendingCommercials = async (accounts, recipiantContract) => {
    // const { accounts, recipiantContract } = this.props
    var filter = {
      owner: accounts[0],
      _attachFrom: masterProxy,
      _attachTo: await recipiantContract._address,
    }
    const allEvents = await this.getCommercials(filter)
    console.log('Commercials Events', allEvents)
    var currentActiveComs = {}
    for (var event of allEvents) {
      if (event['created_consumed_'] == true) {
        event['maxComCount'] = event['currentComCount']
        currentActiveComs[event['id']] = event
      } else if (event['currentComCount'] > 0) {
        currentActiveComs[event['id']]['currentComCount'] =
          event['currentComCount']
        currentActiveComs[event['id']]['balance'] = event['balance']
      } else if (event['is_active'] == false) {
        delete currentActiveComs[event['id']]
      }
    }
    console.log('Pending Commercials', currentActiveComs)
    return currentActiveComs
    // this.setState({
    //   pendingCom: currentActiveComs,
    // })
  }

  getCommercials = async (filter) => {
    // const { eveeContract } = this.props
    const { eveeContract } = this.context

    //const contract_of_remote = await recipiantContract._address
    //		event commercial(address indexed owner , address indexed _attachFrom, address indexed _attachTo, uint balance, string uri, uint comCount ,uint id , bool is_active , bool created_consumed_ , uint nft, address ndtAddress );
    let unused_commercials = await getEvents('commercial', eveeContract._address, {
      filter: filter, // use prev : x to see all x's replies
      fromBlock: 0,
    toBlock: 'latest',
    })
    var myPendingComs = []
    for (var com of unused_commercials) {
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
    return myPendingComs
  }

  getTransfers = async (_filter) => {
    // const { eveeNFTContract } = this.props
    const { eveeNFTContract } = this.context
    console.log(_filter)
    let events = await getEvents('Transfer', eveeNFTContract._address, {
      filter: _filter, // use prev : x to see all x's replies
      fromBlock: 0,
      toBlock: 'latest',
    })
    console.log('ahah',events)
    let transfers = []
    for (let tr of events) {
      let dict = {
        from: tr.returnValues._from,
        to: tr.returnValues._to,
        tokenId: tr.returnValues._tokenId,
      }
      transfers.push(dict)
    }
    return transfers
  }

  getComs = async (_filter) => {
    // const { recipiantContract } = this.props
    const { recipiantContract } = this.context
    let events = await getEvents('post_com', recipiantContract._address, {
      filter: _filter, // use prev : x to see all x's replies
      fromBlock: 0,
      toBlock: 'latest',
    })
    let coms = []
    for (let tr of events) {
      let dict = {
        tokenId: tr.returnValues.tokenId,
        id: tr.returnValues.id,
        NFTContract: tr.returnValues.NFTContract,
      }
      coms.push(dict)
    }
    return coms
  }
  componentDidMount = () => {
    const { accounts, recipiantContract, eveeNFTContract } = this.context
    const getMyActiveCommercialsPromise = this.getMyActiveCommercials(
      accounts,
      recipiantContract,
      eveeNFTContract
    )
    const getMyPendingCommercialsPromise = this.getMyPendingCommercials(
      accounts,
      recipiantContract
    )
    Promise.all([
      getMyActiveCommercialsPromise,
      getMyPendingCommercialsPromise,
    ]).then((promises) => {
      const activeCom = promises[0]
      const pendingCom = promises[1]
      this.setState({
        activeCom,
        pendingCom,
      })
    })
  }

  setURI = async() => {
    const { accounts, recipiantContract, eveeNFTContract } = this.context
    const {postID,postUri} = this.state
    console.log('postID',postID,accounts,'accounts')
    let post = await getPosts(recipiantContract, eveeNFTContract, {
      id: postID,
    })
    console.log(post)
    await eveeNFTContract.methods
      .setTokenUri(parseInt(post[0]['tokenId']),  postUri)
      .send({
        from: accounts[0],
        gasLimit: 6000000,
      })
  }

  getMyActiveCommercials = async (
    accounts,
    recipiantContract,
    eveeNFTContract
  ) => {
    // const { accounts, recipiantContract, eveeNFTContract } = this.props
    console.log('accounts', accounts)
    let filter = { _to: accounts[0] }
    console.log(accounts[0])
    let transfersToMe = await this.getTransfers(filter)
    console.log('Commercials Transfered to me ', transfersToMe)
    let ActiveNFTs = []
    for (let trx of transfersToMe) {
      //test if TX was already logged
      let isNFTLoged = false
      for (let com of ActiveNFTs){
        if (com['tokenId'] == trx['tokenId']){
          isNFTLoged = true
        }
      }
      if (isNFTLoged) break
      //
      let filter2 = { _tokenId: trx['tokenId'] }
      console.log(filter2)
      let history
      history = await this.getTransfers(filter2)
      if (
        history[history.length - 1]['to'].toUpperCase() ==
        accounts[0].toUpperCase()
      ) {
        ActiveNFTs.push(trx)
      }
    }
    console.log('My Active Commercials ', ActiveNFTs)
    let postsWithMyComs = []
    for (let com of ActiveNFTs) {
      let postId
      console.log(com['tokenId'])
      postId = await this.getComs({
        tokenId: com['tokenId'],
        NFTContract: await eveeNFTContract._address,
      })
      let not_done = true
      let post
      console.log(postId[postId.length - 1]['id'])
      post = await getPosts(recipiantContract, eveeNFTContract, {
        id: postId[postId.length - 1]['id'],
      })
      console.log(
        'Account active commercial for post : ',
        com['tokenId'],
        '    ',
        post
      )

      postsWithMyComs.push(post[post.length - 1])
    }
    console.log('Account active commercials are: ', postsWithMyComs)
    return postsWithMyComs
    // this.setState({
    //   activeCom: postsWithMyComs,
    // })
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
    const {
      uri,
      address,
      flag,
      userBidPerCom,
      comCount,
      pendingCom,
      activeCom,
      postID,
      postUri,
    } = this.state
    const { web3 } = this.context
    const pendingComsArray = []
    if (pendingCom)
      for (let obj in pendingCom) pendingComsArray.push(pendingCom[obj])

    console.log(pendingComsArray)

    //this.getMyPendingCommercials()
    return (
      <>
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
        <button onClick={this.setFlag}>Get bid</button>

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
        {activeCom && pendingCom ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1em',
              marginBlock: '1em',
            }}
          >
            {pendingCom && (
              <div style={{ display: 'grid', gap: '1em' }}>
                <p>Pending Commercials: </p>
                {pendingComsArray.map((pendingCom) => (
                  <PendingCommercial
                    key={pendingCom.id}
                    pendingCom={pendingCom}
                  ></PendingCommercial>
                ))}
              </div>
            )}
            {activeCom && (
              <div
                style={{
                  display: 'grid',
                  justifyItems: 'center',
                  gridAutoRows: 'max-content',
                }}
              >
                <p>Active Commercials:</p>
                {activeCom.map((res) => (
                  <ActiveCommercial
                    activeCom={res}
                    key={res.id}
                  ></ActiveCommercial>
                ))}
              </div>
            )}
            {/* <button onClick={this.getMyPendingCommercials}>My Pending Commercials</button>
        <button onClick={this.getMyActiveCommercials}>My Active Commercials</button> */}
          </div>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <Ring color="#be97e8" style={{ justifyItems: 'center' }} />
            loading pending & active commercials
          </div>
        )}
         <div>
          <label>Change post's URI: </label>
          <input
            type="text"
            name="postUri"
            value={postUri}
            placeholder="uri"
            onChange={this.handleInputChange}
          />
          <input
            type="text"
            name="postID"
            value={postID}
            placeholder="postID"
            onChange={this.handleInputChange}
          />
        </div>
        <button onClick={this.setURI}>Set URI</button>
      </>
    )
  }
}

export default Commercial
