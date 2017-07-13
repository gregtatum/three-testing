const { polyfillWindow } = require('./utils')
polyfillWindow()

require('./renderer-snapshot.js')
