var URL = require('url')
var http = require('http')
var cuid = require('cuid')
var methods = require('http-methods')
var Corsify = require('corsify')
var sendJson = require('send-data/json')
var ReqLogger = require('req-logger')
var healthPoint = require('healthpoint')
var HttpHashRouter = require('http-hash-router')

var redis = require('./redis')
var version = require('../package.json').version
var api = require('./controllers/api')

var router = HttpHashRouter({})
var logger = ReqLogger({ version: version })
var health = healthPoint({ version: version }, redis.healthCheck)
var cors = Corsify({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, accept, content-type'
})

router.set('/favicon.ico', empty)
router.set('/api/targets', methods({
  GET: api.getAllTargets,
  POST: api.addTarget
}))
router.set('/api/target/:id', methods({
  GET: api.getTarget,
  POST: api.updateTarget
}))
router.set('/route', methods({
  POST: api.getRoute
}))

module.exports = function createServer () {
  return http.createServer(cors(useJson))
}

function useJson (req, res) {
  var data = ''
  req.on('data', function (chunk) {
    data += chunk
  })
  req.on('end', function () {
    try {
      data = JSON.parse(data)
    } catch (e) {
      data = null
    }
    // console.log('data', data)
    req.data = data
    // callback && callback(req, res)
    handler(req, res)
  })
}

function handler (req, res) {
  if (req.url === '/health') return health(req, res)
  req.id = cuid()
  logger(req, res, { requestId: req.id }, function (info) {
    info.authEmail = (req.auth || {}).email
    console.log(info)
  })
  router(req, res, { query: getQuery(req.url) }, onError.bind(null, req, res))
}

function onError (req, res, err) {
  if (!err) return

  res.statusCode = err.statusCode || 500
  logError(req, res, err)

  sendJson(req, res, {
    error: err.message || http.STATUS_CODES[res.statusCode]
  })
}

function logError (req, res, err) {
  if (process.env.NODE_ENV === 'test') return

  var logType = res.statusCode >= 500 ? 'error' : 'warn'

  console[logType]({
    err: err,
    requestId: req.id,
    statusCode: res.statusCode
  }, err.message)
}

function empty (req, res) {
  res.writeHead(204)
  res.end()
}

function getQuery (url) {
  return URL.parse(url, true).query // eslint-disable-line
}
