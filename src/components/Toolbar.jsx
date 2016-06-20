import React from 'react'

import { connect } from '../lib/inplace-react'

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0
  },

  button: {
    display: 'inline-block',
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
      <div
        id='save'
        style={Object.assign({}, styles.button)}
      >
        Speichern
      </div>
    </div>
  )
}

export default connect(Toolbar)
