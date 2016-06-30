'use strict'

const { readFileSync } = require('fs')
const http = require('http')
const express = require('express')
const chalk = require('chalk')
const mongoose = require('mongoose')
const { models, renderTemplate } = require('@webdesignio/core')
const error = require('http-errors')
const { json } = require('body-parser')

const { Page, Object: _Object, Website } = models(mongoose)

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/webdesignio')

const app = express()
app.set('view engine', 'pug')
app.set('views', 'src')

app.use(express.static(`${__dirname}/static`))

app.get('/static/client.js', (req, res) => {
  res.sendFile(`${process.cwd()}/client.js`)
})

app.get('/:type/new', (req, res, next) => {
  const o = new _Object({ type: req.params.type, data: {} })
  render(res, o).catch(next)
})

app.get('/:type/:object', (req, res, next) => {
  const { params } = req
  _Object.findById(params.object)
    .then(object => object == null ? Promise.reject(error(404)) : object)
    .then(object => render(res, object))
})

app.get(/\/([^/.]*)/, (req, res, next) => {
  const { params } = req
  const pageID = params[0] || 'index'
  const createPage = () =>
    new Page({ _id: pageID, data: {} })
  Page.findById(pageID)
    .then(page => page == null ? createPage() : page)
    .then(page => render(res, page))
    .catch(next)
})

app.put('/:type/:object', json(), (req, res, next) => {
  const { params } = req
  const record = Object.assign({}, req.body.record, { _id: params.object })
  const globals = Object.keys(readPackageJSON().globals)
    .reduce(
      (globals, key) =>
        Object.assign({}, globals, {
          [key]: (req.body.globals || {})[key] || null
        }),
      {}
    )
  updateWebsite({ globals })
    .then(() => _Object.findOne({ _id: params.object, type: params.type }))
    .then(object =>
      object == null
        ? new _Object(record)
        : Object.assign(object, record)
    )
    .then(object => object.save())
    .then(object => res.send(object), next)
})

app.put('/:page', json(), (req, res, next) => {
  const { params } = req
  const record = Object.assign({}, req.body.record, { _id: params.page })
  const globals = Object.keys(readPackageJSON().globals)
    .reduce(
      (globals, key) =>
        Object.assign({}, globals, {
          [key]: (req.body.globals || {})[key] || null
        }),
      {}
    )
  updateWebsite({ globals })
    .then(() => Page.findById(params.page))
    .then(page => page == null
      ? new Page(record)
      : Object.assign(page, record))
    .then(page => page.save())
    .then(page => res.send(page), next)
})

const srv = http.createServer(app)
srv.listen(process.env.PORT || 3000, () => {
  console.log()
  console.log(chalk.bold.green('    web-design.io • server'))
  console.log(chalk.dim.green(`       - on ${chalk.bold.red('port ' + srv.address().port)} -`))
  console.log()
  console.log(
    '    ' +
    chalk.green.bold('✓ ') +
    'Go to ' +
    chalk.cyan.underline('http://localhost:' + srv.address().port + '/') +
    ' to visit your website'
  )
  console.log()
})

function getWebsite () {
  return Website.findOne({})
    .then(website =>
      website != null
        ? website
        : new Website({ _id: 'my-site' })
    )
    .then(patchWebsite)
}

function updateWebsite (data) {
  return getWebsite()
    .then(website => Object.assign(website, data))
    .then(website => website.save())
}

function render (res, record) {
  const view = record.collection.name === 'objects'
    ? `objects/${record.type}`
    : `pages/${record._id}`
  return getWebsite()
    .then(({ globals, currentLanguage, defaultLanguage, languages }) =>
      renderView(res, view, {
        record,
        globals,
        currentLanguage,
        defaultLanguage,
        languages
      })
    )
    .then(html => res.send(html))
}

function renderView (res, path, o) {
  return new Promise((resolve, reject) => {
    res.render(path, (err, html) => {
      if (err) return reject(err)
      resolve(renderTemplate(html, o))
    })
  })
}

function readPackageJSON () {
  return JSON.parse(readFileSync(`${__dirname}/package.json`, 'utf-8')).wdio
}

// Mutates the website!
function patchWebsite (website) {
  const {
    languages,
    defaultLanguage,
    noLangFields
  } = readPackageJSON()
  const globals = Object.keys(readPackageJSON().globals || {})
    .reduce(
      (globals, key) =>
        Object.assign({}, globals, {
          [key]: (website.globals || {})[key] || null
        }),
      {}
    )
  return Object.assign(website, {
    globals,
    languages,
    defaultLanguage,
    noLangFields
  })
}
