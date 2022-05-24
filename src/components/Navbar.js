import React from 'react'
import { Link } from 'react-router-dom'
export const Navbar = () => {
  return (
    <nav
      className="navbar"
      style={{ display: 'flex', gap: '1em', justifyContent: 'center' }}
    >
      <Link to="/user">
        <button>User</button>
      </Link>
      <Link to="/com">
        <button>Commercial</button>
      </Link>
      <Link to="/posts">
        <button>posts</button>
      </Link>
    </nav>
  )
}
