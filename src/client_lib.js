/* global fetch */

import shortid from 'shortid'

export function createContext (ctx) {
  const { token } = ctx
  return Object.assign({}, ctx, { bearer: `Bearer ${token}` })
}

export default function createClient (ctx) {
  return {
    fetch: fetchState.bind(null, ctx),
    save: save.bind(null, ctx),
    triggerBuild: triggerBuild.bind(null, ctx)
  }
}

function fetchWebsite ({ clusterURL, websiteID, bearer }) {
  return fetch(
    `${clusterURL}/api/v1/websites?website=${websiteID}`,
    { headers: { authorization: bearer } }
  )
}

function fetchPageState ({ clusterURL, websiteID, bearer }, id) {
  const promises = [
    fetch(
      `${clusterURL}/api/v1/pages/${id}?website=${websiteID}`,
      { headers: { authorization: bearer } }
    ),
    fetch(
      `${clusterURL}/api/v1/meta/pages%2F${id}?website=${websiteID}`,
      { headers: { authorization: bearer } }
    )
  ]
  return Promise.all(promises)
}

function createObject ({ websiteID }, type) {
  const o = { _id: shortid(), type, website: websiteID, fields: {} }
  return {
    json () { return o },
    status: 200,
    statusText: 'OK'
  }
}

function fetchObjectState (ctx, type, id) {
  const { isNew, websiteID, clusterURL, bearer } = ctx
  const promises = [
    isNew
      ? createObject(ctx, type)
      : fetch(
        `${clusterURL}/api/v1/objects/${id}?website=${websiteID}`,
        { headers: { authorization: bearer } }
      ),
    fetch(
      `${clusterURL}/api/v1/meta/objects%2F${type}?website=${websiteID}`,
      { headers: { authorization: bearer } }
    )
  ]
  return Promise.all(promises)
}

function save (ctx, res, state) {
  const { isObject, isNew } = ctx
  const promises = [
    isObject
      ? updateObject(ctx, res, state)
      : updatePage(ctx, res, state),
    updateWebsite(ctx, res, state)
  ]
  return Promise.all(
    promises
      .map(p =>
        p.then(res =>
          ((res.status / 100) | 0) === 2
            ? res.json()
            : Promise.reject(res.json())
        )
      )
  )
  .then(([record, website]) => {
    if (isNew) {
      window.location = `/${record.type}/${record._id}`
    }
    return Object.assign({}, res, { record, website })
  })
}

function triggerBuild ({ clusterURL, websiteID, bearer }) {
  return fetch(`${clusterURL}/api/v1/websites/build?website=${websiteID}`, {
    method: 'POST',
    headers: {
      authorization: bearer
    }
  })
}

function updateObject (ctx, { website, record }, { locals }) {
  const { clusterURL, websiteID } = ctx
  const putLocation = `/api/v1/objects/${record._id}?website=${websiteID}`
  return putJSON(
    ctx,
    clusterURL + putLocation,
    Object.assign({}, record, { fields: locals.fields })
  )
}

function updatePage (ctx, { record }, { locals }) {
  const { clusterURL, websiteID } = ctx
  const putLocation = `/api/v1/pages/${record._id}?website=${websiteID}`
  return putJSON(
    ctx,
    clusterURL + putLocation,
    Object.assign({}, record, { fields: locals.fields })
  )
}

function updateWebsite (ctx, { website }, { globals }) {
  const { clusterURL, websiteID } = ctx
  return putJSON(
    ctx,
    `${clusterURL}/api/v1/websites?website=${websiteID}`,
    Object.assign({}, website, {
      fields: globals.fields
    })
  )
}

function putJSON (ctx, url, body) {
  return sendJSON(ctx, url, 'PUT', body)
}

function sendJSON ({ bearer }, url, method, body) {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      authorization: bearer
    },
    body: JSON.stringify(body)
  })
}

function fetchState (ctx, { type, id }) {
  const { isObject } = ctx
  return Promise.all(
    [
      fetchWebsite(ctx),
      isObject
        ? fetchObjectState(ctx, type, id)
        : fetchPageState(ctx, id)
    ]
  )
  .then(([websiteRes, [recordRes, metaRes]]) =>
    Promise.all([websiteRes, recordRes, metaRes].map(res =>
      (res.status / 100 | 0) === 2
        ? res.json()
        : Promise.reject(res)
    ))
  )
  .then(([website, record, meta]) => {
    const state = createInitialState({ website, meta, record })
    const res = { website, meta, record, state }
    return res
  })
}

function createInitialState ({ meta, record, website }) {
  const globalFields = website.fieldKeys
    .reduce(
      (fields, key) =>
        Object.assign({}, fields, { [key]: website.fields[key] || null }),
      {}
    )
  return {
    locals: Object.assign({}, meta, { fields: record.fields }),
    globals: { noLangFields: website.noLangFields, fields: globalFields },
    defaultLanguage: website.defaultLanguage,
    languages: website.languages,
    currentLanguage: website.defaultLanguage || website.languages[0]
  }
}
