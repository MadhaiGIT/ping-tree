var sendJson = require('send-data/json')
// var targetModel = require('../models/target')
var targetModel = require('../newModels/target')
// var historyModel = require('../models/history')
var historyModel = require('../newModels/history')
var { getUTCHour, getUTCDateStamp } = require('../utils/util')

module.exports = { getAllTargets, addTarget, getTarget, updateTarget, getRoute }

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
    rep = { data: await targetModel.findById(id) }
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
    if (!await targetModel.findById(id)) {
      res.statusCode = 404
      rep = { error: 'target not found' }
    } else {
      rep = { data: await targetModel.updateById(id, data) }
    }
  }
  sendJson(req, res, rep)
  res.end()
}

async function getRoute (req, res) {
  var data = req.data
  var geoState = data.geoState
  var rep
  if (!data || !geoState || !data.timestamp) {
    res.statusCode = 400
    rep = { error: 'invalid data' }
  } else {
    var date = new Date(data.timestamp)
    var hour = getUTCHour(date)
    // console.log(hour, geoState)
    var targets = await targetModel.findByStateAndHour(geoState, hour)
    targets = targets.sort(function (t1, t2) { return t1.value > t2.value ? -1 : 1 })
    rep = { decision: 'rejected' }
    if (targets && targets.length > 0) {
      var utcDateStamp = getUTCDateStamp(date)
      for (var target of targets) {
        var histories = await historyModel.findByTargetIdAndDateStamp(target.id, utcDateStamp)
        // console.log(utcDateStamp, histories.length)
        if (parseInt(target.maxAcceptsPerDay) > histories.length) {
          rep = { decision: target.url }
          await historyModel.add(target.id, utcDateStamp)
          break
        }
      }
    }
  }
  sendJson(req, res, rep)
  res.end()
}
