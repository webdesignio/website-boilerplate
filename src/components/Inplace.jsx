import ReactDOM from 'react-dom'
import React, { Component } from 'react'
import { connect } from '../lib/inplace-react'

class Inplace extends Component {
  constructor () {
    super()
    this.onChange = this.onChange.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.value !== ReactDOM.findDOMNode(this).textContent
  }

  onChange () {
    const html = ReactDOM.findDOMNode(this).textContent
    if (html !== this.lastHtml) {
      this.props.onUpdate({ [this.props.name]: html })
    }
    this.lastHtml = html
  }

  render () {
    const tag = this.props.tag || 'div'
    const { content: { [this.props.name]: value } } = this.props
    if (this.props.isEditable) {
      return React.createElement(tag, {
        onInput: this.onChange,
        onBlur: this.onChange,
        contentEditable: true,
        className: this.props.className,
        children: value
      })
    } else {
      return React.createElement(tag, {
        className: this.props.className,
        children: value
      })
    }
  }
}

export default connect(Inplace)
