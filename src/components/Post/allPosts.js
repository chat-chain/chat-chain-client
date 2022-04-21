import React, { useContext, useState, useEffect } from 'react'
import { PostUI } from './PostUI'
import Ring from '@bit/joshk.react-spinners-css.ring'
import Web3Context from '../../web3Context'
import getPosts from '../../getPosts'
export const AllPosts = () => {
  const [posts, setPosts] = useState([])
  const { recipiantContract, eveeNFTContract } = useContext(Web3Context)
  useEffect(() => {
    getPosts(recipiantContract, eveeNFTContract, {}).then((posts) => {
      console.log('posts', posts)
      setPosts(posts)
    })
  }, [recipiantContract, eveeNFTContract])
  return (
    <>
      {posts.length > 0 ? (
        posts.map((post) => <PostUI key={post.id} post={post} />)
      ) : (
        <div style={{ display: 'grid', placeItems: 'center' }}>
          LOADING POSTS
          <Ring color="#be97e8" style={{ justifyItems: 'center' }} />
        </div>
      )}
    </>
  )
}
