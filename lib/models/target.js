var client = require('../redis')
var { promisify } = require('util')
var { uuid } = require('uuidv4')
var getAsync = promisify(client.get).bind(client)
var setAsync = promisify(client.set).bind(client)
var getJsonOrNull = require('../utils/util').getJsonOrNull
var key = 'targets'

module.exports = { all, add, findById, updateById, findByStateAndHour }

async function all () {
  try {
    var data = await getAsync(key)
    // console.log('target-all', data)
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

async function findById (id) {
  var targets = await all()
  return targets.find(e => e.id === id) || null
}

async function updateById (id, val) {
  var targets = await all()
  // console.log('targets', targets)
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
  if (!isValid(val)) {
    console.log('target-add', 'invalid')
    return 'Invalid data'
  }
  val.id = uuid()
  var targets = await all()
  targets.push(val)
  return await set(targets)
}

async function findByStateAndHour (state, hour) {
  var targets = await all()
  if (state) targets = targets.filter(h => h.accept.geoState.$in.indexOf(state) > -1)
  if (hour) targets = targets.filter(h => h.accept.hour.$in.indexOf(hour.toString()) > -1)
  // console.log('target-state-hour', targets)
  return targets
}

function isValid (data) {
  return data && data.url && data.value && data.maxAcceptsPerDay && data.accept && data.accept.geoState && data.accept.geoState.$in && data.accept.hour && data.accept.hour.$in
}
