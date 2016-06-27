import React from 'react'
import { connect } from 'react-redux'

import { setEditable, switchLanguage } from '@webdesignio/floorman/actions'
import {
  isEditable,
  currentLanguage,
  languages
} from '@webdesignio/floorman/selectors'

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0
  }
}

function Toolbar ({
  isEditable,
  currentLanguage,
  languages,
  onClickToggle,
  onChangeLanguage
}) {
  return (
    <div style={styles.root}>
      <button
        className='btn btn-default'
        onClick={e => onClickToggle(isEditable, e)}
      >
        {isEditable ? 'Anzeigen' : 'Editieren'}
      </button>
      <div>
        <select
          className='form-control'
          value={currentLanguage}
          onChange={onChangeLanguage}
        >
          {languages.map(lang =>
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          )}
        </select>
      </div>
      <button
        id='save'
        className='btn btn-default'
      >
        Speichern
      </button>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    isEditable: isEditable(state),
    currentLanguage: currentLanguage(state),
    languages: languages(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onClickToggle (isEditable, e) {
      e.preventDefault()
      dispatch(setEditable(!isEditable))
    },

    onChangeLanguage (e) {
      dispatch(switchLanguage(e.target.value))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)
