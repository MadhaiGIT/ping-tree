var sendJson = require('send-data/json')
var targetModel = require('../models/target')

module.exports = { getAllTargets, addTarget, getTarget, updateTarget }

async function getAllTargets (req, res) {
  sendJson(req, res, {
    data: await targetModel.all()
  })
  res.end()
}

async function addTarget (req, res) {
  var data = req.data
  console.log('post-target-data', data)
  var rep
  if (!data) {
    res.statusCode = 400
    rep = { error: 'invalid data' }
  } else {
    rep = { data: await targetModel.add(data) }
  }
  sendJson(req, res, rep, console.log)
  res.end()
}

async function getTarget (req, res, opts) {
  var id = opts.params.id
  var rep
  if (!id) {
    res.statusCode = 400
    rep = { error: 'invalid id' }
  } else {
    rep = { data: await targetModel.getById(id) }
  }
  sendJson(req, res, rep)
  res.end()
}

async function updateTarget (req, res, opts) {
  var data = req.data
  var id = opts.params.id
  console.log('update-target', id, data)
  var rep
  if (!id || !data) {
    res.statusCode = 400
    rep = { error: 'invalid id or target' }
  } else {
    rep = { data: await targetModel.updateById(id, data) }
  }
  sendJson(req, res, rep)
  res.end()
}
