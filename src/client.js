/* global alert */

import 'whatwg-fetch'
import { findAndRender } from '@webdesignio/floorman'
import { save as saveAction } from '@webdesignio/floorman/actions'

import components from './components'

export default function bootstrap (record) {
  const store = findAndRender(components, { record })
  if (process.env.NODE_ENV !== 'production') {
    const saveButton = document.querySelector('#save')
    if (!saveButton) return alert('No save button found :(')
    saveButton.onclick = () => store.dispatch(saveAction())
  }
}
