import React, { Component } from 'react'
import { Bid } from './Bid'
export class Commercial extends Component {
  constructor(props) {
    super(props)

    this.state = {
      uri: '',
      address: '',
      slaveAddress: '',
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
    const { uri, address, userBidPerCom, comCount } = this.state
    const contract_of_remote = await recipiantContract._address
    console.log('BID', parseInt(userBidPerCom))
    await eveeContract.methods
      .acceptComercial(address, contract_of_remote, uri, comCount)
      .send({ from: accounts[0], gasLimit: 6000000, value: parseInt(userBidPerCom) * parseInt(comCount)})

    /* testing of no TXData code
    await eveeContract.methods
      .acceptComercial(address, contract_of_remote, uri)
      .send({ from: accounts[0], gasLimit: 6000000, value: 90000000000000000 })
    */
  }
  addToWhiteList = async () => {
    const { accounts, eveeContract } = this.props
    const { slaveAddress } = this.state
    await eveeContract.methods
      .addToWhiteList(slaveAddress)
      .send({ from: accounts[0], gasLimit: 6000000 })
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
    const { uri, address, slaveAddress, flag, userBidPerCom, comCount } = this.state
    const { web3 } = this.props
    return (
      <>
        <div>
          current commercial address :
          0xf38232721553a3dfa5F7c0E473c6A439CD776038
        </div>
        <div>
          <label>Slave address: </label>
          <input
            type="text"
            name="slaveAddress"
            value={slaveAddress}
            placeholder="slaveAddress"
            onChange={this.handleInputChange}
          />
          <button onClick={this.addToWhiteList}>Add proxy to whitelist</button>
        </div>
        <div>
          <label>address: </label>
          <input
            type="text"
            name="address"
            value={address}
            placeholder="address"
            onChange={this.handleInputChange}
          />
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
