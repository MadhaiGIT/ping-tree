var client = require('../redis')
var { promisify } = require('util')
var { uuid } = require('uuidv4')
var getAsync = promisify(client.get).bind(client)
var setAsync = promisify(client.set).bind(client)
var getJsonOrNull = require('./util').getJsonOrNull
var key = 'targets'

module.exports = { all, add, getById, updateById }

async function all () {
  try {
    var data = await getAsync(key)
    console.log('target-all', data)
    return getJsonOrNull(data) || []
  } catch (e) {
    console.log('target-all', e.message)
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

async function getById (id) {
  var targets = await all()
  return targets.find(e => e.id === id) || null
}

async function updateById (id, val) {
  var targets = await all()
  console.log('targets', targets)
  var updated = []
  for (var target of targets) {
    if (target && target.id === id) {
      val.id = target.id
      updated.push(val)
    }
  }
  return await set(updated)
}

async function add (val) {
  if (!val) {
    console.log('target-add', 'empty val')
    return
  }
  val.id = uuid()
  var targets = await all()
  targets.push(val)
  return await set(targets)
}
