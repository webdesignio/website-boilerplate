import { findAndRender } from 'webdesignio'

import components from './components'

export default function bootstrap (initialContent) {
  findAndRender(components, { initialContent })
}
