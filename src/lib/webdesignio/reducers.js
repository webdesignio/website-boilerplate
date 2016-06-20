import { combineReducers } from 'redux'

import {
  UPDATE_RECORD,
  SET_EDITABLE,
  SAVE,
  SAVE_SUCCESS,
  SAVE_FAILURE
} from './actions'

export default combineReducers({
  originalRecord,
  record,
  isEditable,
  isSaving
})

function originalRecord (state = null, action) {
  switch (action.type) {
    case SAVE_SUCCESS:
      return action.record
    default:
      return state
  }
}

function record (state = null, action) {
  switch (action.type) {
    case SAVE_SUCCESS:
      return action.record
    case UPDATE_RECORD:
      return Object.assign({}, state, {
        data: Object.assign({}, state.data, action.update)
      })
    default:
      return state
  }
}

function isEditable (state = true, action) {
  switch (action.type) {
    case SET_EDITABLE:
      return action.value
    default:
      return state
  }
}

function isSaving (state = false, action) {
  switch (action.type) {
    case SAVE:
      return true
    case SAVE_SUCCESS:
    case SAVE_FAILURE:
      return false
    default:
      return state
  }
}
