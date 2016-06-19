/* global location, fetch */

import { parse } from 'url'
import { findAndRender } from 'webdesignio'
import 'whatwg-fetch'

import components from './components'

const { pathname } = parse(location.href)
const parts = pathname.split('/').filter(p => !!p)
const contentPath = parts.length === 1
  ? `/api/v1/pages/${parts[0]}`
  : `/api/v1/objects/${parts[1]}`
fetch(contentPath)
  .then(res => res.json())
  .then(({ data }) => {
    findAndRender(components, { initialState: data })
  })
