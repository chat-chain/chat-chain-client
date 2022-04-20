import React, { Component } from 'react'
import { Commercial } from './Commercial'
import Web3Context from '../../web3Context'
import Evee from '../../contracts/Evee.json'
import Recipiant from '../../contracts/Recipiant.json'
import eveeNFT from '../../contracts/EveeNFT.json'


export class CommercialState extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      accounts: null,
      recipiantContract: null,
      eveeContract: null,
      eveeNFTContract: null,
    }
  }
  static contextType = Web3Context
  componentDidMount = async () => {
    const { web3, currentProvider } = this.context
    const accounts = await currentProvider.enable()
    const networkId = await web3.eth.net.getId()
    const recipiantContract = new web3.eth.Contract(
      Recipiant.abi,
      Recipiant.networks[networkId].address
    )
    const eveeContract = new web3.eth.Contract(
      Evee.abi,
      Evee.networks[networkId].address
    )
    const eveeNFTContract = new web3.eth.Contract(
      eveeNFT.abi,
      eveeNFT.networks[networkId].address
    )
    this.setState({
      accounts,
      recipiantContract,
      eveeContract,
      web3,
      eveeNFTContract,
    })
  }

  render() {
    const { web3, accounts, recipiantContract, eveeContract , eveeNFTContract} = this.state
    return (
      <>
        <Commercial
          web3={web3}
          accounts={accounts}
          recipiantContract={recipiantContract}
          eveeContract={eveeContract}
          eveeNFTContract={eveeNFTContract}
        />
      </>
    )
  }
}
