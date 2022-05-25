import React, { Component } from 'react'
import axios from 'axios'
import { api } from '../../environment'
export class Bid extends Component {
  constructor(props) {
    super(props)

    this.state = {
      minPriceForCom: null,
      bid: null,
    }
  }
  componentDidMount = async () => {
    const { web3 } = this.props
    const block = await web3.eth.getBlock('pending')
    const { priorityFee, maxGasPerTX } = await this.getGas()
    const minPriceForCom = await this.getMinPriceForCom(
      block.baseFeePerGas,
      priorityFee,
      maxGasPerTX
    )
    const bid = parseInt(minPriceForCom *1.4)
    console.log('min bid = ', minPriceForCom)
    /*const bid = this.getPricePerGas(
      block.baseFeePerGas,
      priorityFee,
      minPriceForCom
    )*/
    this.props.setUserBid(bid)
    this.props.setcomCount(1)
    this.setState({ minPriceForCom, bid })
  }
  getGas = async () => {
    try {
      const priorityFee = await axios.get(
        `${api}/commercial/getMaxPriorityFeePerGas`
      )
      console.log(priorityFee.data)
      const maxGasPerTX = await axios.get(`${api}/gasEstimation`)
      console.log('maxGasPerTX', maxGasPerTX.data)
      return { priorityFee: priorityFee.data, maxGasPerTX: maxGasPerTX.data }
    } catch (err) {
      console.log('caught error: ', err)
    }
    //for testing just return hard coded and comment all above
    // return 1500000000
  }
  getMinPriceForCom = (baseFee, priorityFee, maxGasPerTX) => {
    const MaxFee = parseInt(1.5 * baseFee + priorityFee)
    return maxGasPerTX * MaxFee
  }
  getPricePerGas = (baseFee, priorityFee, minPriceForCom) => {
    const MaxFee = 2 * baseFee + priorityFee
    console.log(
      'baseFee',
      baseFee,
      'priorityFee',
      priorityFee,
      'MaxFee',
      MaxFee
    )
    return minPriceForCom
  }
  handleInputChange = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }

  render() {
    const { bid, minPriceForCom } = this.state
    const { userBidPerCom, comCount } = this.props
    return bid && minPriceForCom && userBidPerCom ? (
      <>
        <div>
          <p>per Com {userBidPerCom/1000000000000000000} eth</p>
          <input
            type="range"
            name="userBidPerCom"
            min={minPriceForCom*0.8}
            value={userBidPerCom}
            max={bid * 2}
            onChange={this.props.handleInputChange}
            step="1000000"
          />
        </div>
        <div>
        <input
            type="text"
            pattern="[0-9]*"
              name="comCount"
              onChange={this.props.handleInputChange}
              value={comCount} 
              />
              </div>
              <p style={{ color: 'green' }}>Total {userBidPerCom/1000000000000000000 * comCount} eth</p>
        <button type="button" onClick={this.props.onSendCommercial}>
          Send Commercial
        </button>
      </>
    ) : null
  }
}

export default Bid
