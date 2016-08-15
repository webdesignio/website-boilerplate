#!/usr/bin/env node

'use strict'

const createComponentIndex = require('./lib/create_component_index')
const pkg = require(`${process.cwd()}/package.json`)

const components = (pkg.webdesignio || {}).components || {}
console.log(createComponentIndex({ components }))
