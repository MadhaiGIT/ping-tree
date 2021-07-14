process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')

var server = require('../lib/server')

test.serial.cb('healthcheck', function (t) {
  var url = '/health'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('getAllTargets', function (t) {
  var url = '/api/targets'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.end()
  })
})

test.serial.cb('getTargetById', function (t) {
  var url = '/api/target/ac753e25-fa5e-4aa5-9c1c-eee737d58a1f'
  servertest(server(), url, {
    encoding: 'json',
    method: 'GET'
  }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.end()
  })
})

test.serial.cb('add Target', function (t) {
  var url = '/api/targets'
  var postData = {
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
  var stream = servertest(server(), url, {
    encoding: 'json',
    method: 'POST'
  })
  stream.on('data', function (data) {
    // console.log('data', data.toString())
    data = JSON.parse(data.toString())
    t.deepEqual(data, { data: 'OK' }, 'correct data')
    t.end()
  })
  stream.write(JSON.stringify(postData))
  stream.end()
})

test.serial.cb('updateTarget', function (t) {
  var url = '/api/target/unkwon-id'
  var postData = {
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
  var stream = servertest(server(), url, {
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

test.serial.cb('test route', function (t) {
  var url = '/route'
  var postData = {
    geoState: 'nv',
    publisher: 'abc',
    timestamp: '2021-07-13T15:28:59.513Z'
  }
  var stream = servertest(server(), url, {
    method: 'POST'
  })
  stream.on('data', function (data) {
    // console.log('data', data.toString())
    data = JSON.parse(data.toString())
    t.notDeepEqual(data, { decision: '' }, 'correct data')
    t.end()
  })
  stream.write(JSON.stringify(postData))
  stream.end()
})
