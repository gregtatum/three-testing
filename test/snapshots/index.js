var path = require('path')
var fs = require('fs')
var diff = require('diff')

// TODO - This would be much better broken out into individual files, and make the
// snapshots human readable.

var FILENAME = '__snapshots.json'
var UPDATE = process.env.UPDATE_SNAPSHOT

module.exports = snapshot

function snapshot (assert, actual, dirname, cache) {

  var testname = assert.name
  var filename = __dirname + '/__snapshots.json'

  // if no cache was passed, try reading from the file
  if (!cache) {
    try {
      var fileExists = fs.statSync(filename)
    } catch (e) {
    }
    try {
      fs.statSync
    } catch (e) {
      // Browserified.
      fileExists = true
    }

    if (fileExists) {
      // Duplicate the filename so brfs can statically include it.
      cache = fs.readFileSync(__dirname + '/__snapshots.json', 'utf8')
      try {
        cache = JSON.parse(cache)
      } catch (e) {
        throw new Error('assert-snapshot: could not parse snapshot file located at ' + filename)
      }
    }
  }

  cache = cache || {}

  if (UPDATE) {
    cache[testname] = actual
    var json = JSON.stringify(cache, null, 2)
    fs.writeFileSync(filename, json)
  }

  var expected = cache[testname] || ''
  if (actual === expected) {
    assert.pass('snapshot matches for "' + testname + '"')
  } else {
    assert.fail('snapshot does not match for "' + testname + '"')
    console.log(
      diff.createTwoFilesPatch(
        '"' + assert.name + '" in ' + FILENAME,
        '"' + assert.name + '" in the test',
        expected,
        actual
      )
    )
  }
}
