'use strict'

const { fork } = require('child_process')

fork(`${__dirname}/build_components`)
fork(`${__dirname}/build_templates`)
fork(`${__dirname}/build_bundles`)
