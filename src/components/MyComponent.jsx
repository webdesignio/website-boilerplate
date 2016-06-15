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

const renderButton = ({ setEditable }) =>
  <button onClick={() => setEditable(false)}>Anzeigen</button>

function MyComponent ({ onUpdate, setEditable, isEditable, content }) {
  return (
    <div className='my-component'>
      {isEditable
        ? renderInput({ onUpdate, content })
        : renderB({ content })}
      <button onClick={() => setEditable(!isEditable)}>
        {isEditable ? 'Anzeigen' : 'Editieren'}
      </button>
    </div>
  )
}

export default connect(MyComponent)
