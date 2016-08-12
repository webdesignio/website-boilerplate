import React, { Component } from 'react'

export default class LoginFormContainer extends Component {
  constructor () {
    super()
    this.handlers = {
      onClickSubmit: this.onClickSubmit.bind(this),
      onChangeEmail: this.onChangeField.bind(this, 'email'),
      onChangePassword: this.onChangeField.bind(this, 'password')
    }
    this.state = {
      error: null,
      email: '',
      password: '',
      token: null
    }
  }

  onChangeField (field, e) {
    this.setState({ [field]: e.target.value })
  }

  onClickSubmit (e) {
    e.preventDefault()
    const { email, password } = this.state
    const tokens = `${process.env.WEBDESIGNIO_CLUSTER_URL}/api/v1/tokens`
    fetch(tokens, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if ((res.status / 100 | 0) === 2) {
        return res.json()
          .then(({ token }) =>
            this.setState({ token }, () => {
              document.querySelector('form[action="/login"]').submit()
            })
          )
      } else if (res.status === 401) {
        this.setState({ error: 'E-Mail or password wrong' })
      } else {
        this.setState({ error: 'Internal server error' })
      }
    })
  }

  render () {
    return (
      <LoginForm {... this.props} {... this.state} {... this.handlers} />
    )
  }
}

const renderTokenInput = ({ token }) =>
  <input type='hidden' name='token' value={token} />

function LoginForm ({
  token,
  email,
  password,
  error,
  onChangeEmail,
  onChangePassword,
  onClickSubmit
}) {
  return (
    <div className='login-form'>
      {error ? <p>{error}</p> : null}
      <form className='form' action='/login' method='POST'>
        <div className='form-group'>
          <label className='control-label'>
            E-Mail
          </label>
          <input type='text' name='email' value={email} onChange={onChangeEmail} />
        </div>
        <div className='form-group'>
          <label className='control-label'>
            Password
          </label>
          <input type='password' name='password' value={password} onChange={onChangePassword} />
        </div>
        <button type='button' onClick={onClickSubmit}>Login</button>
        {token ? renderTokenInput({ token }) : null}
      </form>
    </div>
  )
}
