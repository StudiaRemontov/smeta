const ApiError = require('../utils/ApiError')
const Logger = require('../utils/logger')

const error = (error, req, res, next) => {
  Logger.log('ERROR', error.message)
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message })
  }

  return res.status(500).json({ message: 'Server error' })
}

module.exports = error
