import React from 'react'

import { connect } from '../lib/inplace-react'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0
  },

  button: {
    cursor: 'pointer',
    border: 'solid 1px black',
    padding: '5px',
    backgroundColor: 'white'
  }
}

function Toolbar ({ isEditable, setEditable }) {
  return (
    <div style={styles.root}>
      <div
        style={styles.button}
        onClick={() => setEditable(!isEditable)}
      >
        {isEditable ? 'Anzeigen' : 'Editieren'}
      </div>
    </div>
  )
}

export default connect(Toolbar)
