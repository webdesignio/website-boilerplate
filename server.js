'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const { Page, Object: _Object, renderTemplate } = require('webdesignio')
const mongoose = require('mongoose')
const error = require('http-errors')
const { json } = require('body-parser')

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
  res.render(`objects/${req.params.type}`, (err, html) => {
    if (err) return next(err)
    res.send(renderTemplate(o, html))
  })
})

app.get('/:type/:object', (req, res, next) => {
  const { params } = req
  _Object.findById(params.object)
    .then(object => object == null ? Promise.reject(error(404)) : object)
    .then(object =>
      new Promise((resolve, reject) => {
        res.render(`objects/${req.params.type}`, (err, html) => {
          if (err) return reject(err)
          resolve(renderTemplate(object, html))
        })
      })
    )
    .then(html => res.send(html))
    .catch(next)
})

app.get(/\/([^/]*)/, (req, res, next) => {
  const { params } = req
  const pageID = params[0] || 'index'
  const createPage = () =>
    new Page({ _id: pageID, data: {} })
  Page.findById(pageID)
    .then(page => page == null ? createPage() : page)
    .then(page =>
      new Promise((resolve, reject) => {
        res.render(`pages/${pageID}`, (err, html) => {
          if (err) return reject(err)
          resolve(renderTemplate(page, html))
        })
      })
    )
    .then(html => res.send(html))
    .catch(next)
})

app.put('/:type/:object', json(), (req, res, next) => {
  const { params } = req
  const body = Object.assign({}, req.body, { _id: params.object })
  _Object.findOne({ _id: params.object, type: params.type })
    .then(object =>
      object == null ? new _Object(body) : Object.assign(object, body)
    )
    .then(object => object.save())
    .then(object => res.send(object), next)
})

app.put('/:page', json(), (req, res, next) => {
  const { params } = req
  const body = Object.assign({}, req.body, { _id: params.page })
  Page.findById(params.page)
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
