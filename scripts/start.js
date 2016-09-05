#!/bin/bash

const { relative } = require('path')
const { spawn } = require('child_process')
const glob = require('glob')
const gaze = require('gaze')

const { copyTemplate, compilePugTemplate } = require('./lib/templates')

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
glob.sync('src/@(pages|objects)/*.pug').forEach(compilePugTemplate)
gaze('src/@(pages|objects)/*.html', (err, watcher) => {
  if (err) throw err
  const onBuild = p => copyTemplate(relative(process.cwd(), p))
  watcher.on('changed', onBuild)
  watcher.on('added', onBuild)
})
gaze('src/@(pages|objects)/*.pug', (err, watcher) => {
  if (err) throw err
  const onBuild = p => compilePugTemplate(relative(process.cwd(), p))
  watcher.on('changed', onBuild)
  watcher.on('added', onBuild)
})

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
