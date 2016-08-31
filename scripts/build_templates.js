'use strict'

const { writeFile } = require('fs')
const pug = require('pug')
const glob = require('glob')
const Bluebird = require('bluebird')
const chalk = require('chalk')
const { cp } = require('shelljs')

const writeFileAsync = Bluebird.promisify(writeFile)

glob.sync('src/@(pages|objects)/*.html').forEach(copyTemplate)
const files = glob.sync('src/{pages,objects}/*.pug')
const api = require(`${process.cwd()}/pug_api`)
Promise.all(
  files.map(file => {
    const fn = pug.compileFile(file)
    return writeFileAsync(
      file.replace(/^src\//, '').replace(/pug$/, 'html'),
      fn(api)
    )
  })
)
.then(() => console.log(chalk.green.bold('    ✓ ') + 'All templates built'))

function copyTemplate (file) {
  cp(file, file.replace(/^src\//, ''))
}
