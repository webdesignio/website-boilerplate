/* global fetch */

import { parse } from 'url'
import React, { Component } from 'react'
import connectToField from '@webdesignio/react/connectToField'

class LoginFormContainer extends Component {
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
      token: null,
      isValidating: false,
      isRedirecting: false
    }
  }

  componentDidMount () {
    if (!this.props.isEditable) {
      const clusterURL = parse(this.props.webdesignio.clusterURL)
      const url =
        clusterURL.protocol +
        '//' +
        this.props.webdesignio.websiteID +
        '.' +
        clusterURL.host + '/login'
      window.location.href = url
    }
  }

  onChangeField (field, e) {
    this.setState({ [field]: e.target.value })
  }

  onClickSubmit (e) {
    e.preventDefault()
    this.onSubmit()
  }

  onSubmit () {
    const { email, password } = this.state
    const tokens = `${process.env.WEBDESIGNIO_CLUSTER_URL}/api/v1/tokens`
    this.setState({ isValidating: true })
    fetch(tokens, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      this.setState({ isValidating: false })
      if ((res.status / 100 | 0) === 2) {
        return res.json()
          .then(({ token }) =>
            this.setState({ token, isRedirecting: true }, () => {
              document.querySelector('form[action="/login"]').submit()
            })
          )
      } else if (res.status === 401) {
        this.setState({ error: 'E-Mail and/or password wrong' })
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

const renderError = ({ error }) =>
  <div className='row'>
    <div className='col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 mb-10'>
      <div className='alert alert-danger'>
        <p>{error}</p>
      </div>
    </div>
  </div>

function LoginForm ({
  className,
  token,
  email,
  password,
  error,
  isValidating,
  isRedirecting,
  isEditable,
  onChangeEmail,
  onChangePassword,
  onClickSubmit
}) {
  if (!isEditable) {
    return (
      <p>Redirecting ...</p>
    )
  }
  return (
    <form className='pb-100' action='/login' method='POST'>
      {error ? renderError({ error }) : null}
      <div className='row'>
        <div className='form-group col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 mb-10'>
          <label>
            <h5>E-Mail</h5>
          </label>
          <input
            value={email}
            className='form-control text-center'
            type='text'
            disabled={isValidating || isRedirecting}
            onChange={onChangeEmail}
          />
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 mb-10'>
          <label>
            <h5>Password</h5>
          </label>
          <input
            value={password}
            className='form-control text-center'
            type='password'
            disabled={isValidating || isRedirecting}
            onChange={onChangePassword}
          />
        </div>
        <div className='forgot-link col-md-4 col-sm-3 text text-left text-xs-center mt-40 mt-xs-0 pt-10'>
          <a href>forgot?</a>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 mt-20'>
          <button
            type='submit'
            className='btn btn-lg btn-block'
            disabled={isValidating || isRedirecting}
            onClick={onClickSubmit}
          >
            {isRedirecting
              ? 'Redirecting ...'
              : `Log In ${isValidating ? '...' : ''}`}
          </button>
        </div>
      </div>
      {token ? renderTokenInput({ token }) : null}
    </form>
  )
}

export default connectToField({ defaultName: 'login' })(LoginFormContainer)
