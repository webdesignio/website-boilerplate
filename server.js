'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const { Page, Object: _Object, renderTemplate } = require('webdesignio')
const mongoose = require('mongoose')
const error = require('http-errors')

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
    res.send(renderTemplate(o.data, html))
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
          resolve(renderTemplate(object.data, html))
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
    new Page({ _id: pageID, data: { title: pageID } })
  Page.findById(pageID)
    .then(page => page == null ? createPage() : page)
    .then(page =>
      new Promise((resolve, reject) => {
        res.render(`pages/${pageID}`, (err, html) => {
          if (err) return reject(err)
          resolve(renderTemplate(page.data, html))
        })
      })
    )
    .then(html => res.send(html))
    .catch(next)
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
