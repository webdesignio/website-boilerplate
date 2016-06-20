import { createStore as createReduxStore } from 'redux'

import reduce from './reducers'

export function createStore ({ record }) {
  const store = createReduxStore(reduce, { originalRecord: record, record })
  return store
}

export function findAll (components) {
  const slice = Array.prototype.slice
  const els = slice.call(document.querySelectorAll('[data-component]'))
  return els
    .map(el => (
      !components[el.getAttribute('data-component')]
        ? null
        : {
          component: components[el.getAttribute('data-component')],
          props: JSON.parse(decodeURI(el.getAttribute('data-props') || '{}')),
          el
        }
    ))
    .filter(n => !!n)
}

export function renderAll (components, props) {
  components.forEach(def =>
    def.component(Object.assign({}, def.props, props), def.el)
  )
}

export function findAndRender (components, opts) {
  const store = createStore(opts)
  renderAll(findAll(components), { store })
  return store
}
