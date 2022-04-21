import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { UserState } from './components/User/UserState'
import { CommercialState } from './components/Commercial/CommercialState'
import Post from './components/Post/Post'
import { AllPosts } from './components/Post/allPosts'
export const Routing = () => {
  return (
    <Routes>
      <Route path="user" element={<UserState />} />
      <Route path="com" element={<CommercialState />} />
      <Route path="post/:postId" element={<Post />} />
      <Route path="posts" element={<AllPosts />} />
    </Routes>
  )
}
