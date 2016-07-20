/* global alert, location, fetch, Headers */

import { parse } from 'url'
import 'whatwg-fetch'
import { compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { findAndRender } from '@webdesignio/floorman'
import { save, saveSuccess, saveFailure } from '@webdesignio/floorman/actions'
import reduce from '@webdesignio/floorman/reducers'

import components from './components'

export default function bootstrap ({ meta, record, website }) {
  const store = findAndRender(
    components,
    reduce,
    {
      locals: Object.assign({}, meta, { fields: record.data }),
      globals: { noLangFields: website.noLangFields, fields: website.fields },
      defaultLanguage: website.defaultLanguage,
      languages: website.languages,
      currentLanguage: website.defaultLanguage || website.languages[0]
    },
    compose(
      applyMiddleware(thunk),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  )
  if (process.env.NODE_ENV !== 'production') {
    const saveButton = document.querySelector('#save')
    if (!saveButton) return alert('No save button found :(')
    saveButton.onclick = saveHandler
  }

  function saveHandler () {
    const { pathname } = parse(location.href)
    const isObject = !!record.type
    const isNew = !!pathname.match(/\/new$/)
    const putLocation =
      isObject ? `/${record.type}/${record._id}` : `/${record._id}`
    store.dispatch(save())
    const { globals, locals } = store.getState()
    fetch(putLocation, {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        record: Object.assign({}, record, { data: locals.fields }),
        globals: globals.fields
      })
    })
    .then(res => res.json())
    .then(record => {
      store.dispatch(saveSuccess(record))
      if (isObject && isNew) window.location = putLocation
    })
    .catch(e => store.dispatch(saveFailure(e)))
  }
}
