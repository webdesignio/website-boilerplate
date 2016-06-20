/* global location, alert, fetch, Headers */

import 'whatwg-fetch'
import { parse } from 'url'
import { createProps, renderAll, findAll } from 'webdesignio'

import components from './components'

const { pathname } = parse(location.href)
const putLocation = pathname === '/'
  ? '/index'
  : pathname

export default function bootstrap (record) {
  const props = createProps({ record })
  renderAll(findAll(components), props)
  if (process.env.NODE_ENV !== 'production') {
    const saveButton = document.querySelector('#save')
    if (!saveButton) return alert('No save button found :(')
    console.log(saveButton)
    saveButton.onclick = save.bind(null, props)
  }
}

function save ({ store }) {
  const { record } = store.getState()
  fetch(putLocation, {
    method: 'PUT',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(record)
  })
}
