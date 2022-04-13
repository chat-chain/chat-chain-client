import React, { Component } from 'react'
import './App.css'
import getWeb3 from './getWeb3'
import Evee from './contracts/Evee.json'
import EveeNFT from './contracts/EveeNFT.json'
import Recipiant from './contracts/Recipiant.json'
import { Routes, Route } from 'react-router-dom'
import { CommercialState } from './components/Commercial/CommercialState'
import { Navbar } from './components/Navbar'
import { Web3Provider } from './web3Context'
import { UserState } from './components/User/UserState'
import detectEthereumProvider from '@metamask/detect-provider'
import Post from './components/Post/Post'
import Ring from '@bit/joshk.react-spinners-css.ring'
import PostUI from './components/Post/PostUI'
import getPosts from './getPosts'
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

    this.setState(
      {
        web3,
        accounts,
        recipiantContract,
        eveeContract,
        eveeNFTContract,
        currentProvider,
      },
      this.runExample
    )
  }

  runExample = () => {
    const { accounts, recipiantContract, eveeNFTContract } = this.state
    // Get the value from the contract to prove it worked.
    console.log('accounts[0]', accounts[0].toUpperCase())

    console.log('RES', recipiantContract)
    // const changUriEvents = await eveeNFTContract.getPastEvents(
    //   'ChangeUri',
    //   {
    //     filter: {}, // use prev : x to see all x's replies
    //     fromBlock: 0,
    //     toBlock: 'latest',
    //   },
    //   (error, events) => {
    //     console.log(events)
    //   }
    // )
    // changUriEvents.forEach((Elemnt) => console.log('changUriEvents', Elemnt))
    getPosts(recipiantContract, eveeNFTContract, {}).then((posts) => {
      console.log('posts', posts)
      this.setState({ posts })
    })

    // Update state with the result.
  }

  render() {
    const {
      web3,
      posts,
      currentProvider,
      eveeNFTContract,
      recipiantContract,
      accounts,
    } = this.state
    if (!web3)
      return <div>Loading Web3, accounts, and recipiantContract...</div>
    return (
      <div className="App">
        <Navbar />
        <h2>EVEE Free To Use BlockChain Social Media Example</h2>
        <div>
          <Web3Provider value={{ web3, currentProvider }}>
            <Routes>
              <Route path="user" element={<UserState />} />
              <Route path="com" element={<CommercialState />} />
              <Route
                path="post/:postId"
                element={
                  <Post
                    recipiantContract={recipiantContract}
                    eveeNFTContract={eveeNFTContract}
                    currentProvider={currentProvider}
                    accounts={accounts}
                  />
                }
              />
            </Routes>
          </Web3Provider>
        </div>
        <>
          {posts ? (
            posts.map((post) => (
              <PostUI
                key={post.id}
                post={post}
                currentProvider={currentProvider}
                recipiantContract={recipiantContract}
                accounts={accounts}
              />
            ))
          ) : (
            <div style={{ display: 'grid', placeItems: 'center' }}>
              LOADING POSTS
              <Ring color="#be97e8" style={{ justifyItems: 'center' }} />
            </div>
          )}
        </>
      </div>
    )
  }
}

export default App
