'use strict'

const { render } = require('mustache')

module.exports = createMustacheAPI()

function createMustacheAPI () {
  return {
    view: {
      title: 'Webdesign.io',
      assets () {
        if (process.env.NODE_ENV === 'production') {
          const config = require('../.webdesigniorc.json').config || {}
          const settings = require('../package.json').webdesignio || {}
          const domainTemplate = config.domain || ''
          const protocol = config.protocol || 'https'
          const { defaultLanguage } = settings
          if (!defaultLanguage) throw new Error('No default language given!')
          const domain = render(domainTemplate, { language: defaultLanguage })
          return `${protocol}://` + domain.replace(/\/+$/, '')
        }
        return ''
      }
    },

    partials: {
      meta: `
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="application-name" content="webdesignio boilerplate">
<meta name="msapplication-TileColor" content="#FFFFFF">
<meta name="msapplication-TileImage" content="mstile-144x144.png">
<meta name="msapplication-square70x70logo" content="{{assets}}/ico/mstile-70x70.png">
<meta name="msapplication-square150x150logo" content="{{assets}}/ico/mstile-150x150.png">
<meta name="msapplication-wide310x150logo" content="{{assets}}/ico/mstile-310x150.png">
<meta name="msapplication-square310x310logo" content="{{assets}}/ico/mstile-310x310.png">
`,
      links: `
<link rel="apple-touch-icon-precomposed" sizes="57x57" href="{{assets}}/ico/apple-touch-icon-57x57.png">
<link rel="apple-touch-icon-precomposed" sizes="114x114" href="{{assets}}/ico/apple-touch-icon-114x114.png">
<link rel="apple-touch-icon-precomposed" sizes="72x72" href="{{assets}}/ico/apple-touch-icon-72x72.png">
<link rel="apple-touch-icon-precomposed" sizes="144x144" href="{{assets}}/ico/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon-precomposed" sizes="60x60" href="{{assets}}/ico/apple-touch-icon-60x60.png">
<link rel="apple-touch-icon-precomposed" sizes="120x120" href="{{assets}}/ico/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon-precomposed" sizes="76x76" href="{{assets}}/ico/apple-touch-icon-76x76.png">
<link rel="apple-touch-icon-precomposed" sizes="152x152" href="{{assets}}/ico/apple-touch-icon-152x152.png">
<link rel="icon" type="image/png" href="{{assets}}/ico/favicon-196x196.png" sizes="196x196">
<link rel="icon" type="image/png" href="{{assets}}/ico/favicon-96x96.png" sizes="96x96">
<link rel="icon" type="image/png" href="{{assets}}/ico/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="{{assets}}/ico/favicon-16x16.png" sizes="16x16">
<link rel="icon" type="image/png" href="{{assets}}/ico/favicon-128.png" sizes="128x128">
<link href="{{assets}}/css/bootstrap.min.css" rel="stylesheet">
<link href="{{assets}}/css/style.css" rel="stylesheet">
<link href="{{assets}}/css/icons.css" rel="stylesheet">
`
    }
  }
}
