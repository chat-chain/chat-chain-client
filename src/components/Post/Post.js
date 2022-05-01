import React, { useState, useEffect, useCallback,useContext } from 'react'
import { useParams } from 'react-router-dom'
import { PostUI } from './PostUI'
import getPosts from '../../getPosts'
import Web3Context from '../../web3Context'

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
      const posts_msg = (
        await recipiantContract.getPastEvents('post_msg', {
          filter: {
            id: postId,
          }, // use prev : x to see all x's replies
          fromBlock: 0,
          toBlock: 'latest',
        })
      ).shift()

      //get sommercial's uri of each post (its located in EveeNFT)

      // let uri
      //normal post
      //normal post
      posts_msg.returnValues.urlLink = null
      if (!posts_msg.returnValues.freePost) {
        posts_msg.returnValues.uri = null
      } else {
        // try to extract metadata from uri, otherwise uri will be the the image
        try {
          posts_msg.returnValues.uri = await eveeNFTContract.methods
            .tokenURI(posts_msg.returnValues.tokenId)
            .call()
          try {
            const obj = await fetch(posts_msg.returnValues.uri)
            // console.log('obj', obj)
            const jsoni = await obj.json()
            posts_msg.returnValues.uri = jsoni.image
            // console.log('the json', jsoni)
            posts_msg.returnValues.urlLink = jsoni.external_url
          } catch (e) {
            //console.log('something went wrong with meta data extraction', e)
          }
        } catch (e) {
          //console.log('something went wrong with image of commercial', e)
        }
        //id 0's defulat commercial
      }
      return posts_msg
    },
    []
  )

  const getsons = useCallback(
    async (postId, eveeNFTContract, recipiantContract) => {
      let sons = await getPosts(recipiantContract, eveeNFTContract, {
        prev: postId,
      })
      return sons
    },
    []
  )

  const getfatrhers = useCallback(
    async (post, eveeNFTContract, recipiantContract, limit) => {
      let _id = post.returnValues.prev
      let fathers = []
      if (post.returnValues.id !== '0') {
        for (let i = 0; i < limit; i++) {
          let posts = await getPosts(recipiantContract, eveeNFTContract, {
            id: _id,
          })
          fathers.push(posts)
          _id = posts[0].prev
          if (_id === '0' && posts[0].id === '0') return fathers
        }
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
      const fathers = await getfatrhers(
        posts_msg,
        eveeNFTContract,
        recipiantContract,
        3
      )
      console.log('fathers', postId, '     ', fathers)
      const { id, prev, body, sender, uri } = posts_msg.returnValues
      const postToEnter = {
        id,
        prev,
        body,
        sender,
        uri,
      }
      setPost(postToEnter)
    },
    [get_main_post, getfatrhers, getsons]
  )
const {eveeNFTContract, recipiantContract, currentProvider, accounts}=useContext(Web3Context)
  // const { eveeNFTContract, recipiantContract, currentProvider, accounts } =
  //   props
  const [post, setPost] = useState(null)
  const { postId } = useParams()
  useEffect(() => {
    getPostsAndRelations(postId, eveeNFTContract, recipiantContract).catch(console.error)
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
        border: '3px solid yellow',
      }}
    >
      {post && <PostUI post={post} />}
    </div>
  )
}
