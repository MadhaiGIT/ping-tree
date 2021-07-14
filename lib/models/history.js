var client = require('../redis')
var { promisify } = require('util')
var { uuid } = require('uuidv4')
var getAsync = promisify(client.get).bind(client)
var setAsync = promisify(client.set).bind(client)
var { getJsonOrNull } = require('../utils/util')
var key = 'history'

module.exports = { all, add, findById, updateById, findByTargetIdAndDateStamp }

async function all () {
  try {
    var data = await getAsync(key)
    // console.log('history-all', data)
    return getJsonOrNull(data) || []
  } catch (e) {
    console.log('history-all', e.message)
  }
  return []
}

async function set (data) {
  try {
    if (typeof data === 'object') return await setAsync(key, JSON.stringify(data))
  } catch (e) {
    console.log('set-all', e.message)
    return e
  }
}

async function findById (id) {
  var histories = await all()
  return histories.find(e => e.id === id) || null
}

async function findByTargetIdAndDateStamp (targetId, dateStamp) {
  var histories = await all()
  return histories.filter(e => e.targetId === targetId && e.date === dateStamp) || []
}

async function updateById (id, val) {
  var histories = await all()
  // console.log('histories', histories)
  var updated = []
  for (var history of histories) {
    if (history && history.id === id) {
      val.id = history.id
      updated.push(val)
    }
  }
  return await set(updated)
}

async function add (targetId, dateStamp) {
  if (!targetId) {
    console.log('history-add', 'empty target id')
    return
  }
  var val = {
    id: uuid(),
    targetId,
    date: dateStamp
  }
  var records = await all()
  records.push(val)
  return await set(records)
}
