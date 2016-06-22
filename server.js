'use strict'

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

app.get('/static/client.js', (req, res) => {
  res.sendFile(`${process.cwd()}/client.js`)
})

app.get('/:type/new', (req, res, next) => {
  const o = new _Object({ data: {} })
  getWebsite()
    .then(({ globals }) => globals || {})
    .then(
      globals => {
        res.render(`objects/${req.params.type}`, (err, html) => {
          if (err) return next(err)
          res.send(renderTemplate({ record: o, globals }, html))
        })
      },
      next
    )
})

app.get('/:type/:object', (req, res, next) => {
  const { params } = req
  getWebsite()
    .then(({ globals }) => globals || {})
    .then(globals =>
      _Object.findById(params.object)
        .then(object => object == null ? Promise.reject(error(404)) : object)
        .then(object =>
          renderView(res, `objects/${req.params.type}`, {
            record: object,
            globals
          })
        )
    )
    .then(html => res.send(html), next)
})

app.get(/\/([^/.]*)/, (req, res, next) => {
  const { params } = req
  const pageID = params[0] || 'index'
  const createPage = () =>
    new Page({ _id: pageID, data: {} })
  getWebsite()
    .then(({ globals }) =>
      Page.findById(pageID)
        .then(page => page == null ? createPage() : page)
        .then(page =>
          renderView(res, `pages/${pageID}`, { record: page, globals })
        )
    )
    .then(html => res.send(html), next)
})

app.put('/:type/:object', json(), (req, res, next) => {
  const { params } = req
  const body = Object.assign({}, req.body, { _id: params.object })
  updateWebsite({ globals: body.globals })
    .then(() => _Object.findOne({ _id: params.object, type: params.type }))
    .then(object =>
      object == null
        ? new _Object(body.record)
        : Object.assign(object, body.record)
    )
    .then(object => object.save())
    .then(object => res.send(object), next)
})

app.put('/:page', json(), (req, res, next) => {
  const { params } = req
  const body = Object.assign({}, req.body, { _id: params.page })
  updateWebsite({ globals: body.globals })
    .then(() => Page.findById(params.page))
    .then(page => page == null ? new Page(body) : Object.assign(page, body))
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
    .then(website => {
      return website != null
        ? website
        : new Website({
          _id: 'my-site',
          globals: require('./package.json').wdio.globals
        })
    })
}

function updateWebsite (data) {
  return getWebsite()
    .then(website => Object.assign(website, data))
    .then(website => website.save())
}

function renderView (res, path, o) {
  return new Promise((resolve, reject) => {
    res.render(path, (err, html) => {
      if (err) return reject(err)
      resolve(renderTemplate(html, o))
    })
  })
}
