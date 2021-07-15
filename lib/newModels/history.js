var client = require('../redis')
var { promisify } = require('util')
var getAsync = promisify(client.get).bind(client)
var setAsync = promisify(client.set).bind(client)
var getJsonOrNull = require('../utils/util').getJsonOrNull
var KeyNextIndex = 'historyNextIndex'
var KeyPrefix = 'history-'

module.exports = { all, add, findById, updateById, findByTargetIdAndDateStamp }

async function findById (id) {
  try {
    var history = await getAsync(KeyPrefix + id)
    return getJsonOrNull(history)
  } catch (e) {
    console.log('history-get-by-id-e:', e.message)
    return null
  }
}

async function all () {
  try {
    var nextIndex = await getNextIndex()
    var histories = []
    for (var id = 0; id < nextIndex; id++) {
      var history = await findById(id)
      if (history) histories.push(history)
    }
    return histories
  } catch (e) {
    console.log('history-get-all-e:', e.message)
    return []
  }
}

async function add (history) {
  try {
    var nextIndex = await getNextIndex()
    history.id = nextIndex
    var newKey = KeyPrefix + nextIndex
    if (typeof history === 'object') {
      history = JSON.stringify(history)
    }
    await setAsync(newKey, history)
    await increaseNextIndex()
    return {
      success: true,
      id: nextIndex
    }
  } catch (e) {
    console.log('history-add-e:', e.message)
    return {
      success: false
    }
  }
}

async function updateById (id, history) {
  try {
    var key = KeyPrefix + id
    history.id = id
    if (typeof history === 'object') {
      history = JSON.stringify(history)
    }
    await setAsync(key, history)

    return {
      success: true,
      id
    }
  } catch (e) {
    console.log('history-update-by-id-e:', e.message)
    return {
      success: false
    }
  }
}

async function findByTargetIdAndDateStamp (targetId, dateStamp) {
  try {
    var histories = await all()
    return histories.filter(e => e.targetId === targetId && e.date === dateStamp) || []
  } catch (e) {
    console.log('history-find-by-state-hour-e:', e.message)
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
