#!/bin/bash

const { spawn } = require('child_process')

const env = Object.assign({}, process.env, { FORCE_COLOR: 'true' })
spawn('webdesignio-dozer', ['watch'], { env, stdio: 'inherit' })
spawn('node-dev', ['server.js'], { env, stdio: 'inherit' })
