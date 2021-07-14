module.exports = { getJsonOrNull }

function getJsonOrNull (str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}
