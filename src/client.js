/* global location */

import { parse } from 'url'
import 'whatwg-fetch'
import { compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { findAll, renderAll, findAndRender } from '@webdesignio/floorman'
import reduce from '@webdesignio/floorman/reducers'
import createClient, { createContext } from '@webdesignio/client'

import components from './components'

const { pathname } = parse(location.href)
const isObject = pathname.split('/').length >= 3
const type = isObject ? pathname.split('/')[1] : null
const id = isObject ? pathname.split('/')[2] : (pathname.split('/')[1] || 'index')
const isNew = !!pathname.match(/\/new$/)
const cookies = document.cookie
  .split(';')
  .map(s => s.trim())
  .reduce(
    (cookies, pair) =>
      Object.assign({}, cookies, { [pair.split('=')[0]]: pair.split('=')[1] }),
    {}
  )
const { token } = cookies
const client = createClient(
  createContext({
    clusterURL: process.env.WEBDESIGNIO_CLUSTER_URL,
    isObject,
    isNew,
    websiteID: process.env.WEBDESIGNIO_WEBSITE,
    token
  })
)
const middleware =
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )

if (!pathname.match(/\/login$/)) {
  client.fetch({ type, id })
    .then(r => {
      let res = r
      const { state } = res
      const store = findAndRender(
        components,
        saveStateReducer(reduce),
        state,
        middleware
      )
      const saveButton = document.querySelector('#save')
      if (!saveButton) return
      saveButton.onclick = e => {
        e.preventDefault()
        store.dispatch({ type: 'SAVE' })
        client.save(res, store.getState())
          .then(r => {
            res = r
            store.dispatch({ type: 'SAVE_SUCCESS' })
            return client.triggerBuild()
          })
          .catch(() => {
            store.dispatch({ type: 'SAVE_FAILURE' })
          })
      }
    })
} else {
  renderAll(findAll(components), {})
}

function saveStateReducer (child) {
  return (state, action) => saveState(child(state, action), action)

  function saveState (state, action) {
    switch (action.type) {
      case 'SAVE':
        return Object.assign({}, state, { isSaving: true })
      case 'SAVE_SUCCESS':
      case 'SAVE_FAILURE':
        return Object.assign({}, state, {
          isSaving: false,
          success: action.type === 'SAVE_SUCCESS'
        })
      default:
        return Object.assign({}, state, {
          isSaving: !!state.isSaving,
          success: state.success == null ? true : state.success
        })
    }
  }
}
