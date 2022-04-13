import React, { Component } from 'react'
import { signData } from '../../signData'
import { paidPost } from '../../signData'

export class User extends Component {
  constructor(props) {
    super(props)

    this.state = {
      text: '',
      prev: '',
    }
  }
  handleInputChange = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }
  handleUserSignFree = () => {
    const { text, prev } = this.state
    const { account, recipiantContract, currentProvider } = this.props
    signData(text, prev, account, recipiantContract, currentProvider)
  }
   handleUserSignPaid = () => {
    const { text, prev } = this.state
    const { account, recipiantContract, currentProvider } = this.props
    paidPost(text, prev, account, recipiantContract, currentProvider)
  }
  render() {
    const { text, prev } = this.state
    return (
      <>
        <textarea
          type="text"
          name="text"
          value={text}
          placeholder="text"
          onChange={this.handleInputChange}
        />
        <input
          type="uint"
          name="prev"
          value={prev}
          placeholder="prev"
          onChange={this.handleInputChange}
        />
        <button type="button" onClick={() => this.handleUserSignFree()}>
          Send a free post
        </button>
        <button type="button" onClick={() => this.handleUserSignPaid()}>
          Send a paid post
        </button>
      </>
    )
  }
}

export default User
