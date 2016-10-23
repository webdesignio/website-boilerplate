/* global location */

import { parse } from 'url'
import 'whatwg-fetch'
import { compose, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import { findAll, renderAll, findAndRender } from '@webdesignio/floorman'
import { map as reducers } from '@webdesignio/floorman/reducers'
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
  const enhancedReducers = Object.assign({}, reducers, additionalReducers())
  const reduce = combineReducers(enhancedReducers)
  client.fetch({ type, id })
    .then(r => {
      let res = r
      const { state } = res
      const store = findAndRender(components, reduce, state, middleware)
      const flash = createFlash(store)
      const saveButton = document.querySelector('#save')
      if (!saveButton) return
      saveButton.onclick = e => {
        e.preventDefault()
        store.dispatch({ type: 'SAVE' })
        client.save(res, store.getState())
          .then(r => {
            res = r
            store.dispatch({ type: 'SAVE_SUCCESS' })
            flash({ message: 'Successfully saved! Publishing page ...' })
            return client.triggerBuild()
          })
          .catch(() => {
            flash({ type: 'error', message: 'Failed to save!' })
            store.dispatch({ type: 'SAVE_FAILURE' })
          })
      }
    })
} else {
  renderAll(findAll(components), {})
}

function createFlash (store, { showTime = 2000 } = {}) {
  let flashID = 0
  let timeout = null
  return function flash ({ type = 'success', message }) {
    const id = ++flashID
    store.dispatch({ type: 'SHOW_FLASH', flash: { type, message } })
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      if (flashID === id) store.dispatch({ type: 'CLEAR_FLASH' })
    }, showTime)
  }
}

function additionalReducers () {
  return { flash, isSaving }

  function flash (state = null, action) {
    switch (action.type) {
      case 'SHOW_FLASH':
        return action.flash
      case 'CLEAR_FLASH':
        return null
      default:
        return state
    }
  }

  function isSaving (state = false, action) {
    switch (action.type) {
      case 'SAVE':
        return true
      case 'SAVE_SUCCESS':
      case 'SAVE_FAILURE':
        return false
      default:
        return state
    }
  }
}
