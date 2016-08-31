#!/bin/bash

const { writeFile } = require('fs')
const { relative } = require('path')
const { spawn } = require('child_process')
const glob = require('glob')
const gaze = require('gaze')
const pug = require('pug')
const { cp } = require('shelljs')

let rc
try {
  rc = require(`${process.cwd()}/.webdesigniorc.json`)
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('    No rc found!')
    process.exit()
  } else {
    throw e
  }
}
const env = Object.assign({}, process.env, {
  NODE_ENV: 'development',
  WEBDESIGNIO_CLUSTER_URL: '',
  WEBDESIGNIO_WEBSITE: rc.id,
  FORCE_COLOR: 'true'
})

glob.sync('src/@(pages|objects)/*.html').forEach(copyTemplate)
glob.sync('src/@(pages|objects)/*.pug').forEach(buildTemplate)
gaze('src/@(pages|objects)/*.html', (err, watcher) => {
  if (err) throw err
  const onBuild = p => copyTemplate(relative(process.cwd(), p))
  watcher.on('changed', onBuild)
  watcher.on('added', onBuild)
})
gaze('src/@(pages|objects)/*.pug', (err, watcher) => {
  if (err) throw err
  const onBuild = p => buildTemplate(relative(process.cwd(), p))
  watcher.on('changed', onBuild)
  watcher.on('added', onBuild)
})

function copyTemplate (file) {
  console.log('copy template', file)
  cp(file, file.replace(/^src\//, ''))
}

function buildTemplate (file) {
  const api = require(`${process.cwd()}/pug_api`)
  console.log('compile template', file)
  const fn = pug.compileFile(file)
  return writeFile(
    file.replace(/^src\//, '').replace(/pug$/, 'html'),
    fn(api)
  )
}

spawn('watch-run', [
  '-i', '-p', 'src/pages/**,src/objects/**',
  'sh -c "node scripts/create_component_index > src/components/index.js"'
], { env, stdio: 'inherit' })
spawn('watchify', [
  '-s', 'CMS',
  '-t', '[', 'babelify', '--presets', '[', 'react', 'es2015', ']', ']',
  '-t', 'envify',
  '-o', 'static/client.js',
  'src/client.js',
  '-v'
], { env, stdio: 'inherit' })
spawn('node-dev', ['server.js'], { env, stdio: 'inherit' })
