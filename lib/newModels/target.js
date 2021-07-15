var client = require('../redis')
var { promisify } = require('util')
var getAsync = promisify(client.get).bind(client)
var setAsync = promisify(client.set).bind(client)
var getJsonOrNull = require('../utils/util').getJsonOrNull
var KeyNextIndex = 'targetNextIndex'
var KeyPrefix = 'target-'

module.exports = { all, add, findById, updateById, findByStateAndHour }

async function findById (id) {
  try {
    var target = await getAsync(KeyPrefix + id)
    return getJsonOrNull(target)
  } catch (e) {
    console.log('target-get-by-id-e:', e.message)
    return null
  }
}

async function all () {
  try {
    var nextIndex = await getNextIndex()
    var targets = []
    for (var id = 0; id < nextIndex; id++) {
      var target = await findById(id)
      if (target) targets.push(target)
    }
    return targets
  } catch (e) {
    console.log('target-get-all-e:', e.message)
    return []
  }
}

async function add (target) {
  try {
    var nextIndex = await getNextIndex()
    target.id = nextIndex
    var newKey = KeyPrefix + nextIndex
    if (typeof target === 'object') {
      target = JSON.stringify(target)
    }
    await setAsync(newKey, target)
    await increaseNextIndex()
    return {
      success: true,
      id: nextIndex
    }
  } catch (e) {
    console.log('target-add-e:', e.message)
    return {
      success: false
    }
  }
}

async function updateById (id, target) {
  try {
    var key = KeyPrefix + id
    target.id = id
    if (typeof target === 'object') {
      target = JSON.stringify(target)
    }
    await setAsync(key, target)

    return {
      success: true,
      id
    }
  } catch (e) {
    console.log('target-update-by-id-e:', e.message)
    return {
      success: false
    }
  }
}

async function findByStateAndHour (state, hour) {
  try {
    var targets = await all()
    if (state) targets = targets.filter(h => h.accept.geoState.$in.indexOf(state) > -1)
    if (hour) targets = targets.filter(h => h.accept.hour.$in.indexOf(hour.toString()) > -1)
    return targets
  } catch (e) {
    console.log('target-find-by-state-hour-e:', e.message)
    return []
  }
}

async function getNextIndex () {
  var val = await getAsync(KeyNextIndex) || '0'
  return parseInt(val)
}

async function increaseNextIndex () {
  await setAsync(KeyNextIndex, await getNextIndex() + 1)
}
