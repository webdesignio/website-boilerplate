const { render } = require('mustache')

module.exports = {
  asset (path) {
    if (process.env.NODE_ENV === 'production') {
      const config = require('./.webdesigniorc.json').config || {}
      const settings = require('./package.json').webdesignio || {}
      const domainTemplate = config.domain || ''
      const protocol = config.protocol || 'https'
      const { defaultLanguage } = settings
      if (!defaultLanguage) throw new Error('No default language given!')
      const domain = render(domainTemplate, { language: defaultLanguage })
      return `${protocol}://` + domain.replace(/\/+$/, '') + path
    }
    return path
  }
}
