import React, { Component } from 'react'
import Web3Context from '../../web3Context'
import Evee from '../../contracts/Evee.json'
import Recipiant from '../../contracts/Recipiant.json'
import { User } from './User'
export class UserState extends Component {
  constructor(props) {
    super(props)

    this.state = {
      account: null,
      recipiantContract: null,
      eveeContract: null,
      web3: null,
      currentProvider: null,
    }
  }
  static contextType = Web3Context
  componentDidMount = async () => {
    const { web3, currentProvider } = this.context
    const accounts = await currentProvider.enable()
    const networkId = await web3.eth.net.getId()
      console.log('networkId',networkId)

      console.log('Recipiant.networks[networkId].address',Recipiant.networks[networkId].address)

    const recipiantContract = new web3.eth.Contract(Recipiant.abi,Recipiant.networks[networkId].address)

    const eveeContract = new web3.eth.Contract(Evee.abi, Evee.networks[networkId].address)


    
    this.setState({
      account: accounts[0],
      recipiantContract,
      eveeContract,
      web3,
      currentProvider,
    })
  }
  render() {
    const { account, recipiantContract, eveeContract, web3, currentProvider } =
      this.state
    return (
      <>
        <User
          account={account}
          recipiantContract={recipiantContract}
          eveeContract={eveeContract}
          web3={web3}
          currentProvider={currentProvider}
        />
      </>
    )
  }
}
