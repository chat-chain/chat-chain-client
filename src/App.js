import React, { Component } from 'react'
import './App.css'
import getWeb3 from './getWeb3'
import Evee from './contracts/Evee.json'
import EveeNFT from './contracts/EveeNFT.json'
import Recipiant from './contracts/Recipiant.json'
import { Navbar } from './components/Navbar'
import { Web3Provider } from './web3Context'
import detectEthereumProvider from '@metamask/detect-provider'
import { Routing } from './routing'
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      accounts: null,
      contract: null,
      currentProvider: null,
    }
  }

  componentDidMount = async () => {
    // Get network provider and web3 instance.
    const currentProvider = await detectEthereumProvider()
    const web3 = await getWeb3()
    // Use web3 to get the user's accounts.
    const accounts = await currentProvider.enable()

    // Get the contract instance.
    const networkId = await web3.eth.net.getId()
    console.log('networkId', networkId)

    console.log(
      'Recipiant.networks[networkId].address',
      Recipiant.networks[networkId].address
    )

    const recipiantContract = new web3.eth.Contract(
      Recipiant.abi,
      Recipiant.networks[networkId].address
    )

    const eveeContract = new web3.eth.Contract(
      Evee.abi,
      Evee.networks[networkId].address
    )

    const eveeNFTContract = new web3.eth.Contract(
      EveeNFT.abi,
      EveeNFT.networks[networkId].address
    )

    this.setState({
      web3,
      accounts,
      recipiantContract,
      eveeContract,
      eveeNFTContract,
      currentProvider,
    })
  }

  render() {
    const {
      web3,
      currentProvider,
      eveeNFTContract,
      recipiantContract,
      accounts,
      eveeContract,
    } = this.state
    if (!web3)
      return <div>Loading Web3, accounts, and recipiantContract...</div>
    return (
      <div className="App">
        <Navbar />
        <h2 style={{ textAlign: 'center' }}>
          Chat-Chain
        </h2>
        <>
          <Web3Provider
            value={{
              web3,
              currentProvider,
              recipiantContract,
              eveeNFTContract,
              accounts,
              eveeContract,
            }}
          >
            <Routing></Routing>
          </Web3Provider>
        </>
      </div>
    )
  }
}

export default App
