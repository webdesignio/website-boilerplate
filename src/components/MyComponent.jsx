import React from 'react'
import { connect } from 'react-redux'

import { update } from '@webdesignio/floorman/actions'
import {
  createValueSelector,
  isEditable
} from '@webdesignio/floorman/selectors'

const renderInput = ({ onChange, value }) =>
  <input
    type='text'
    value={value || ''}
    placeholder='Type it'
    onChange={onChange}
  />

const renderB = ({ value }) =>
  <b>{value}</b>

function MyComponent ({ onChange, isEditable, value }) {
  return (
    <div className='my-component'>
      <br />
      <b>
        This is my component which shows the same content as the component
        above
      </b>
      <br />
      {isEditable
        ? renderInput({ onChange, value })
        : renderB({ value })}
    </div>
  )
}

function mapStateToProps (state) {
  const value = createValueSelector()
  return (state) => ({
    isEditable: isEditable(state),
    value: value(state, 'title')
  })
}

function mapDispatchToProps (dispatch) {
  return {
    onChange (e) {
      dispatch(update({ title: e.target.value }))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent)
