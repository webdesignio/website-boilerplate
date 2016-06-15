import React from 'react'

import { connect } from '../lib/inplace-react'

const renderInput = ({ onUpdate, content: { title } }) =>
  <input
    type='text'
    value={title || ''}
    placeholder='Type it'
    onChange={e => onUpdate({ title: e.target.value })}
  />

const renderB = ({ content: { title } }) =>
  <b>{title}</b>

function MyComponent ({ onUpdate, setEditable, isEditable, content }) {
  return (
    <div className='my-component'>
      <br />
      <b>
        This is my component which shows the same content as the component
        above
      </b>
      <br />
      {isEditable
        ? renderInput({ onUpdate, content })
        : renderB({ content })}
    </div>
  )
}

export default connect(MyComponent)
