process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')

var server = require('../lib/server')
var commonServer = server()
test.serial.cb('healthcheck', function (t) {
  var url = '/health'
  servertest(commonServer, url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

/***
 * Test for get all targets
 * Expected: { data: [] }
 */
test.serial.cb('getAllTargets', function (t) {
  var url = '/api/targets'
  servertest(commonServer, url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    console.log('res', res)
    t.deepEqual(res.body, { data: [] }, 'correct data')
    t.end()
  })
})

/***
 * Test for getting target by id
 * Expected: { data: null }
 */
test.serial.cb('get target by id 1', function (t) {
  var url = '/api/target/0'
  servertest(commonServer, url, {
    encoding: 'json',
    method: 'GET'
  }, function (err, res) {
    t.falsy(err, 'no error')

    console.log('res', res.body)
    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, { data: null }, 'correct data')
    t.end()
  })
})

var targetToAdd = {
  id: 0,
  url: 'https://microsoft.com',
  value: '0.90',
  maxAcceptsPerDay: '3',
  accept: {
    geoState: {
      $in: ['nv', 'ny']
    },
    hour: {
      $in: ['15', '16', '17']
    }
  }
}
/***
 * Test for adding a target.
 * Expected: { data: { success: true, id: 0 }}
 */
test.serial.cb('add Target', function (t) {
  var url = '/api/targets'
  var postData = targetToAdd
  var stream = servertest(commonServer, url, {
    encoding: 'json',
    method: 'POST'
  })
  stream.on('data', function (data) {
    console.log('data', data.toString())
    data = JSON.parse(data.toString())
    t.deepEqual(data, { data: { success: true, id: 0 } }, 'correct data')
    t.end()
  })
  stream.write(JSON.stringify(postData))
  stream.end()
})

/***
 * Test for getting target by id
 * Expected: { data: { ..targetToAdd.. } }
 */
test.serial.cb('get target by id 2', function (t) {
  var url = '/api/target/0'
  servertest(commonServer, url, {
    encoding: 'json',
    method: 'GET'
  }, function (err, res) {
    t.falsy(err, 'no error')

    console.log('res', res.body)
    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, { data: targetToAdd }, 'correct data')
    t.end()
  })
})

/***
 * Test for updating an existing target
 * Expected: { data: { success: true, id: 0 } }
 */
test.serial.cb('update target 1', function (t) {
  var url = '/api/target/0'
  var postData = {
    url: 'https://example.com',
    value: '0.90',
    maxAcceptsPerDay: '3',
    accept: {
      geoState: {
        $in: ['nv', 'ny']
      },
      hour: {
        $in: ['15', '16', '17']
      }
    }
  }
  var stream = servertest(commonServer, url, {
    encoding: 'json',
    method: 'POST'
  })
  stream.on('data', function (data) {
    // console.log('data', data.toString())
    data = JSON.parse(data.toString())
    t.deepEqual(data, { data: { success: true, id: 0 } }, 'correct data')
    t.end()
  })
  stream.write(JSON.stringify(postData))
  stream.end()
})

/***
 * Test for updating a non-existing target
 * Expected: { error: 'target not found' }
 */
test.serial.cb('update target 2', function (t) {
  var url = '/api/target/10'
  var postData = {
    url: 'https://example.com',
    value: '0.90',
    maxAcceptsPerDay: '3',
    accept: {
      geoState: {
        $in: ['nv', 'ny']
      },
      hour: {
        $in: ['15', '16', '17']
      }
    }
  }
  var stream = servertest(commonServer, url, {
    encoding: 'json',
    method: 'POST'
  })
  stream.on('data', function (data) {
    // console.log('data', data.toString())
    data = JSON.parse(data.toString())
    t.deepEqual(data, { error: 'target not found' }, 'correct data')
    t.end()
  })
  stream.write(JSON.stringify(postData))
  stream.end()
})

/***
 * Test for route accepted
 * Expected: { decision: 'https://example.com' }
 */
test.serial.cb('test route 1', function (t) {
  var url = '/route'
  var postData = {
    geoState: 'nv',
    publisher: 'abc',
    timestamp: '2021-07-13T15:28:59.513Z'
  }
  var stream = servertest(commonServer, url, {
    method: 'POST'
  })
  stream.on('data', function (data) {
    console.log('data', data.toString())
    data = JSON.parse(data.toString())
    t.deepEqual(data, { decision: 'https://example.com' }, 'correct data')
    t.end()
  })
  stream.write(JSON.stringify(postData))
  stream.end()
})

/***
 * Test for route rejected
 * Expected: { decision: 'rejected' }
 */
test.serial.cb('test route 2', function (t) {
  var url = '/route'
  var postData = {
    geoState: 'fl',
    publisher: 'abc',
    timestamp: '2021-07-13T15:28:59.513Z'
  }
  var stream = servertest(commonServer, url, {
    method: 'POST'
  })
  stream.on('data', function (data) {
    // console.log('data', data.toString())
    data = JSON.parse(data.toString())
    t.deepEqual(data, { decision: 'rejected' }, 'correct data')
    t.end()
  })
  stream.write(JSON.stringify(postData))
  stream.end()
})
