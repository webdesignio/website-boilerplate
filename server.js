'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')

const app = express()
app.set('view engine', 'pug')
app.set('views', 'src')

app.get('/static/client.js', (req, res) => {
  res.sendFile(`${process.cwd()}/client.js`)
})

app.get('/:type/new', (req, res, next) => {
  res.render(`objects/${req.params.type}`)
})

app.get('/:page', (req, res, next) => {
  res.render(`pages/${req.params.page}`)
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
