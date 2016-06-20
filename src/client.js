import { findAndRender } from 'webdesignio'

import components from './components'

export default function bootstrap (record) {
  findAndRender(components, { record })
}
