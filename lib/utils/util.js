module.exports = { getJsonOrNull, getUTCDateStamp, getUTCHour }

function getJsonOrNull (str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}

function getUTCDateStamp (val) {
  var current = new Date(val)
  return `${current.getUTCFullYear()}-${current.getUTCMonth()}-${current.getUTCDate()}`
}

function getUTCHour (val) {
  var current = new Date(val)
  return current.getUTCHours()
}
