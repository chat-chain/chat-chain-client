import React from 'react'
const Web3Context = React.createContext('no context')
const Web3Provider = Web3Context.Provider
const Web3Consumer = Web3Context.Consumer

export { Web3Provider, Web3Consumer }
export default Web3Context
