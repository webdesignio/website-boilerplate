/* global alert, location, fetch, Headers */

import { parse } from 'url'
import 'whatwg-fetch'
import shortid from 'shortid'
import { compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { findAndRender } from '@webdesignio/floorman'
import { save, saveSuccess, saveFailure } from '@webdesignio/floorman/actions'
import reduce from '@webdesignio/floorman/reducers'

import components from './components'

const { pathname, hostname } = parse(location.href)
const websiteID = hostname.split('.')[0]
const isObject = pathname.split('/').length >= 3
const type = isObject ? pathname.split('/')[1] : null
const id = isObject ? pathname.split('/')[2] : (pathname.split('/')[1] || 'index')
const isNew = !!pathname.match(/\/new$/)

Promise.all(
  [
    fetch(`${process.env.WEBDESIGNIO_CLUSTER_URL}/api/v1/websites/${websiteID}?website=${websiteID}`),
    fetch(`${process.env.WEBDESIGNIO_CLUSTER_URL}/api/v1/meta/${isObject ? 'objects' : 'pages'}%2F${isObject ? type : id}?website=${websiteID}`),
    isObject && isNew
      ? Promise.resolve({ _id: shortid(), type, website: websiteID, fields: {} })
      : fetch(`${process.env.WEBDESIGNIO_CLUSTER_URL}/api/v1/${isObject ? 'objects' : 'pages'}/${id}?website=${websiteID}`)
  ]
  .map(p =>
    p.then(res => typeof res.json === 'function' ? res.json() : res)
  )
)
.then(([website, meta, record]) =>
  bootstrap({ meta, record, website })
)

function bootstrap ({ meta, record, website }) {
  const store = findAndRender(
    components,
    reduce,
    {
      locals: Object.assign({}, meta, { fields: record.fields }),
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
  const saveButton = document.querySelector('#save')
  if (!saveButton) return alert('No save button found :(')
  saveButton.onclick = saveHandler

  function saveHandler () {
    const putLocation =
      isObject
        ? `/api/v1/objects/${record._id}?website=${website._id}`
        : `/api/v1/pages/${record.name}?website=${website._id}`
    store.dispatch(save())
    const { globals, locals } = store.getState()
    Promise.all(
      [
        fetch(process.env.WEBDESIGNIO_CLUSTER_URL + putLocation, {
          method: 'PUT',
          headers: new Headers({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(
            Object.assign({}, record, { fields: locals.fields })
          )
        }),
        fetch(`${process.env.WEBDESIGNIO_CLUSTER_URL}/api/v1/websites/${websiteID}`, {
          method: 'PUT',
          headers: new Headers({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(
            Object.assign({}, website, {
              fields: globals.fields
            })
          )
        })
      ]
      .map(p =>
        p.then(res =>
          ((res.status / 100) | 0) === 2
            ? res.json()
            : Promise.reject(res.json())
        )
      )
    )
    .then(([record]) => {
      store.dispatch(saveSuccess(record))
      if (isObject && isNew) {
        window.location = `/${record.type}/${record._id}`
      }
    })
    .then(() =>
      fetch(`${process.env.WEBDESIGNIO_CLUSTER_URL}/api/v1/websites/${websiteID}/build`, {
        method: 'POST'
      })
    )
    .catch(e => store.dispatch(saveFailure(e)))
  }
}
