import ReactDOM from 'react-dom'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { updateRecord } from '@webdesignio/floorman/actions'
import {
  createValueSelector,
  isEditable
} from '@webdesignio/floorman/selectors'

class Inplace extends Component {
  constructor () {
    super()
    this.onChange = this.onChange.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return (
      nextProps.value !== ReactDOM.findDOMNode(this).textContent
    ) || this.props.isEditable !== nextProps.isEditable
  }

  onChange () {
    const html = ReactDOM.findDOMNode(this).textContent
    if (html !== this.lastHtml) {
      this.props.onUpdate(html)
    }
    this.lastHtml = html
  }

  render () {
    const tag = this.props.tag || 'div'
    const { value } = this.props
    if (this.props.isEditable) {
      return React.createElement(tag, {
        onInput: this.onChange,
        onBlur: this.onChange,
        contentEditable: true,
        className: this.props.className,
        suppressContentEditableWarning: true,
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

function mapStateToProps (state, { name }) {
  const value = createValueSelector(name)
  return {
    isEditable: isEditable(state),
    value: value(state)
  }
}

function mapDispatchToProps (dispatch, { name }) {
  return {
    onUpdate (value) {
      dispatch(updateRecord({ [name]: value }))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Inplace)
