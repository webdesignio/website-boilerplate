'use strict'

const { dirname } = require('path')
const { writeFile, readFile, readFileSync, existsSync } = require('fs')
const http = require('http')
const express = require('express')
const cors = require('cors')
const chalk = require('chalk')
const error = require('http-errors')
const { json } = require('body-parser')
const mkdirp = require('mkdirp')
const Bluebird = require('bluebird')

const readFileAsync = Bluebird.promisify(readFile)
const writeFileAsync = Bluebird.promisify(writeFile)
const mkdirpAsync = Bluebird.promisify(mkdirp)

function saveModel (path, model) {
  return mkdirpAsync(dirname(path))
    .then(() =>
      writeFileAsync(
        path,
        JSON.stringify(model, null, 2)
      )
      .then(() => model)
    )
}

function findById (collectionName, id) {
  const Type = this
  const p = `data/${collectionName}/${id}.json`
  if (!existsSync(p)) return Promise.resolve(null)
  return readFileAsync(p)
    .then(content => JSON.parse(content.toString('utf-8')))
    .then(data => new Type(data))
}

class Model {
  constructor (data) {
    Object.assign(this, data)
  }

  toObject () {
    return this
  }
}

class Website extends Model {
  save () {
    return saveModel('data/website.json', this)
  }
}
Website.prototype.collection = { name: 'websites' }
Website.findOne = () => {
  const p = 'data/website.json'
  if (!existsSync(p)) return Promise.resolve(null)
  return readFileAsync(p)
    .then(content => JSON.parse(content.toString('utf-8')))
    .then(data => new Website(data))
}

class Page extends Model {
  save () {
    return saveModel(`data/pages/${this._id}.json`, this)
  }
}
Page.prototype.collection = { name: 'pages' }
Page.findById = findById.bind(Page, 'pages')

class _Object extends Model {
  save () {
    return saveModel(`data/objects/${this._id}.json`, this)
  }
}
_Object.prototype.collection = { name: 'objects' }
_Object.findById = findById.bind(_Object, 'objects')

const app = express()

app.get('/api/v1/websites', (req, res, next) => {
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
    JSON.parse(readFileSync(`${req.params.filename}.meta.json`))
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
  _Object.findById(object)
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
    .then(page =>
      res.send(Object.assign({}, page, { name: page._id })),
      next
    )
})

app.put('/api/v1/websites', json(), (req, res, next) => {
  const { fields = {} } = req.body
  updateWebsite({ fields })
    .then(website => res.send(website))
    .catch(next)
})

app.post('/api/v1/websites/build', (req, res) =>
  res.send({ ok: true })
)

app.post('/api/v1/tokens', (req, res) => res.send({ token: 'testtoken' }))

app.use(express.static(`${__dirname}/static`))

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

app.post('/login', (req, res) => res.redirect('/'))

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
  res.sendFile(`${process.cwd()}/${view}.html`)
}

function readPackageJSON () {
  return JSON.parse(readFileSync(`${__dirname}/package.json`, 'utf-8')).webdesignio
}

// Mutates the website!
function patchWebsite (website) {
  const {
    languages,
    defaultLanguage,
    noLangFields,
    globals
  } = readPackageJSON()
  return Object.assign(website, {
    fields: website.fields || {},
    fieldKeys: globals,
    languages,
    defaultLanguage,
    noLangFields
  })
}
