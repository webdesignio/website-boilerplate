export const UPDATE_RECORD = 'UPDATE_RECORD'
export const SET_EDITABLE = 'SET_EDITABLE'
export const SAVE = 'SAVE'
export const SAVE_SUCCESS = 'SAVE_SUCCESS'
export const SAVE_FAILURE = 'SAVE_FAILURE'

export function updateRecord (update) {
  return { type: UPDATE_RECORD, update }
}

export function setEditable (value) {
  return { type: SET_EDITABLE, value }
}

export function save () {
  return { type: SAVE }
}

export function saveSuccess (record) {
  return { type: SAVE_SUCCESS, record }
}

export function saveFailure () {
  return { type: SAVE_FAILURE }
}
