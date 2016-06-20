/* global location, alert, fetch, Headers */

import 'whatwg-fetch'
import { parse } from 'url'
import { findAndRender } from './lib/webdesignio'
import { save as saveAction, saveSuccess, saveFailure } from './lib/webdesignio/actions'

import components from './components'

const { pathname } = parse(location.href)
const putLocation = pathname === '/'
  ? '/index'
  : pathname

export default function bootstrap (record) {
  const store = findAndRender(components, { record })
  if (process.env.NODE_ENV !== 'production') {
    const saveButton = document.querySelector('#save')
    if (!saveButton) return alert('No save button found :(')
    saveButton.onclick = save.bind(null, store)
  }
}

function save (store) {
  store.dispatch(saveAction())
  const { record } = store.getState()
  fetch(putLocation, {
    method: 'PUT',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(record)
  })
  .then(res => res.json())
  .then(record => store.dispatch(saveSuccess(record)))
  .catch(e => store.dispatch(saveFailure(e)))
}
