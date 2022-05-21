import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react'
import Web3Context from 'web3Context'

export const Sons = (props) => {
  const { son } = props
  const { currentProvider, recipiantContract, eveeContract, accounts } =
    useContext(Web3Context)
  return (
    <>
      <p>
        <label>id: </label>
        <span>{son.id}</span>
      </p>
    </>
  )
}
