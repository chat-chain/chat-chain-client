import React, { useState, useEffect, useCallback, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { PostUI } from './PostUI'
import getPosts from 'getPosts'
import Web3Context from 'web3Context'
import { Sons } from './Sons'

export default function Post(props) {
  const get_main_post = useCallback(
    async (postId, eveeNFTContract, recipiantContract) => {
      // const posts_com = (
      //   await recipiantContract.getPastEvents('post_com', {
      //     filter: {
      //       id: postId,
      //     }, // use prev : x to see all x's replies
      //     fromBlock: 0,
      //     toBlock: 3490,
      //   })
      // ).shift()
      // get msg post part

      let posts_msg = await getPosts(recipiantContract, eveeNFTContract, {
        id: postId,
      })

      console.log('ahaha', posts_msg)
      posts_msg = posts_msg[0]

      return posts_msg
    },
    []
  )

  const getsons = useCallback(
    async (postId, eveeNFTContract, recipiantContract) => {
      let sons = await getPosts(recipiantContract, eveeNFTContract, {
        prev: postId,
      })
      const real_sons = []
      for (let son of sons){
        if (son.id!=0){
          real_sons.push(son)
        }
      }
      return real_sons
    },
    []
  )

  const getFathers = useCallback(
    async (post, eveeNFTContract, recipiantContract, limit) => {
      let _id = post.prev
      const fathers = []
      if (post.id !== '0') {
        for (let i = 0; i < limit; i++) {
          const posts = await getPosts(recipiantContract, eveeNFTContract, {
            id: _id,
          })
          fathers.push(posts[0])
          _id = posts[0].prev
          if (_id === '0' && posts[0].id === '0') return fathers
        }
        return fathers
      } else {
        return fathers
      }
    },
    []
  )

  const getPostsAndRelations = useCallback(
    async (postId, eveeNFTContract, recipiantContract) => {
      // get main commercial
      const posts_msg = await get_main_post(
        postId,
        eveeNFTContract,
        recipiantContract
      )
      // get sons
      const sons = await getsons(postId, eveeNFTContract, recipiantContract)
      console.log('replies to ', postId, '     ', sons)
      // get 3 fathers
      const fathers = await getFathers(
        posts_msg,
        eveeNFTContract,
        recipiantContract,
        1
      )
      console.log('fathers', postId, '     ', fathers)
      //const { id, prev, body, sender, uri } = posts_msg.returnValues
      const id = posts_msg.id
      const prev = posts_msg.prev
      const body = posts_msg.body
      const sender = posts_msg.sender
      const uri = posts_msg.uri
      const freePost = posts_msg.freePost
      const timestamp = posts_msg.timestamp
      const postToEnter = {
        id,
        prev,
        body,
        sender,
        uri,
        freePost,
        timestamp,
      }
      setPost(postToEnter)
      setSons(sons)
      setFathers(fathers)
    },
    [get_main_post, getFathers, getsons]
  )
  const { eveeNFTContract, recipiantContract, currentProvider, accounts } =
    useContext(Web3Context)
  // const { eveeNFTContract, recipiantContract, currentProvider, accounts } =
  //   props
  const [post, setPost] = useState(null)
  const [sons, setSons] = useState(null)
  const [fathers, setFathers] = useState(null)

  const { postId } = useParams()
  useEffect(() => {
    getPostsAndRelations(postId, eveeNFTContract, recipiantContract).catch(
      console.error
    )
  }, [
    getPostsAndRelations,
    postId,
    eveeNFTContract,
    recipiantContract,
    currentProvider,
    accounts,
  ])

  return (
    <div
      style={{
        display: 'grid',
        gap: '1.5em',
      }}
    >
      {fathers && (
        <div>
          {fathers.map((father) => (
            <Sons key={father.id} post={father} />
          ))}
        </div>
      )}
      {post && <PostUI post={post} />}
      {/* {sons && <Sons sons={sons} />} */}
      {sons && (
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            paddingBlock: '1em',
            gap: '56px',
          }}
        >
          {sons.map((son) => (
            <Sons key={son.id} post={son} />
          ))}
        </div>
      )}
    </div>
  )
}
