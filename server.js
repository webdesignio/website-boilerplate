'use strict'

const { readFileSync, existsSync } = require('fs')
const http = require('http')
const express = require('express')
const cors = require('cors')
const chalk = require('chalk')
const mongoose = require('mongoose')
const error = require('http-errors')
const { json } = require('body-parser')

const Website = mongoose.model('websites', new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  defaultLanguage: { type: String, required: true },
  languages: { type: [String], required: true },
  noLangFields: { type: [String], required: true },
  fields: { type: {}, required: true }
}, { minimize: false }))

const Page = mongoose.model('pages', new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  website: { type: String, required: true },
  fields: { type: {}, required: true }
}, { minimize: false }))

const _Object = mongoose.model('objects', new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  website: { type: String, required: true },
  fields: { type: {}, required: true }
}, { minimize: false }))

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/webdesignio')

const app = express()
app.set('view engine', 'pug')
app.set('views', 'src')

app.get('/api/v1/websites/:website', (req, res, next) => {
  getWebsite()
    .then(website => res.send(website))
    .catch(next)
})

app.get('/api/v1/meta/:filename', (req, res, next) => {
  if (!existsSync(`src/${req.params.filename}.meta.json`)) {
    res.send({ noLangFields: [] })
    return
  }
  const meta = Object.assign(
    { noLangFields: [] },
    JSON.parse(readFileSync(`src/${req.params.filename}.meta.json`))
  )
  res.send(meta)
})

app.use('/api', cors())

app.get('/api/v1/:type/:id', (req, res, next) => {
  const O = req.params.type === 'objects' ? _Object : Page
  O.findById(req.params.id)
    .then(o => {
      if (req.params.type === 'pages') {
        if (o == null) {
          res.send(
            {
              _id: req.params.id,
              name: req.params.id,
              website: req.query.website,
              fields: {}
            }
          )
          return
        }
        return res.send(Object.assign({}, o.toObject(), { name: o._id }))
      }
      res.send(o)
    })
    .catch(next)
})

app.put('/api/v1/objects/:object', json(), (req, res, next) => {
  const { params: { object } } = req
  const record = Object.assign({}, req.body, { _id: object })
  _Object.findOne({ _id: object })
    .then(object =>
      object == null
        ? new _Object(record)
        : Object.assign(object, record)
    )
    .then(object => object.save())
    .then(object => res.send(object))
    .catch(next)
})

app.put('/api/v1/pages/:page', json(), (req, res, next) => {
  const { params: { page }, query: { website } } = req
  const { _id, fields } = Object.assign({}, req.body, { _id: page })
  Page.findById(page)
    .then(page => page == null
      ? new Page({ fields, website, _id })
      : Object.assign(page, { fields, website }))
    .then(page => page.save())
    .then(page => res.send(page), next)
})

app.put('/api/v1/websites/:website', json(), (req, res, next) => {
  const fields = Object.keys(readPackageJSON().globals)
    .reduce(
      (globals, key) =>
        Object.assign({}, globals, {
          [key]: (req.body.fields || {})[key] || null
        }),
      {}
    )
  updateWebsite({ fields })
    .then(website => res.send(website))
    .catch(next)
})

app.post('/api/v1/websites/:website/build', (req, res) =>
  res.send({ ok: true })
)

app.use(express.static(`${__dirname}/static`))

app.get('/client.js', (req, res) => {
  res.sendFile(`${process.cwd()}/client.js`)
})

app.get('/:type/new', (req, res, next) => {
  const o = new _Object({ type: req.params.type, data: {} })
  render(res, o)
})

app.get('/:type/:object', (req, res, next) => {
  const { params } = req
  _Object.findById(params.object)
    .then(object => object == null ? Promise.reject(error(404)) : object)
    .then(object => render(res, object))
    .catch(next)
})

app.get('/index', (req, res) => res.redirect('/'))

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

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    res.status(400).send({ errors: err.errors, message: err.message })
    return
  }
  next(err)
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
        : new Website({ _id: 'my-site', languages: [] })
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
  res.render(view, require('./pug_api.js'))
}

function readPackageJSON () {
  return JSON.parse(readFileSync(`${__dirname}/package.json`, 'utf-8')).webdesignio
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
