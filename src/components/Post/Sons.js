import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react'
import Web3Context from 'web3Context'
import styles from './Post.module.css'
import { useNavigate, useLocation } from 'react-router-dom'

export const Sons = (props) => {
  const { post } = props
  const { currentProvider, recipiantContract, eveeContract, accounts } =
    useContext(Web3Context)
  const navigate = useNavigate()
  const location = useLocation()

  const onSonClick = () => {
    navigate(`/post/${post.id}`)
  }

  return (
    <main
      className={`${styles.postUI_container} ${styles.sons} ${styles.son_card}`}
      onClick={() => onSonClick()}
    >
      <div>
        <label>Id =</label> <span>{post.id}</span>
        <label> Prev = </label>
        <span> {post.prev}</span>
      </div>
      <p>{post.timestamp.toLocaleString()}</p>
      <p className={styles.account_profile}> {post.sender}</p>
      <div>
        <p> {post.body}</p>
      </div>
    </main>
  )
}
