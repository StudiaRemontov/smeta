const Logger = require('../utils/Logger')

const error = (error, req, res, next) => {
  Logger.log('ERROR', error.message)
  res.status(400).json({ error })
}

module.exports = error
