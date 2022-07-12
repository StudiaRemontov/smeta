const StatusService = require('../services/StatusService')

class StatusController {
  static async get(req, res, next) {
    try {
      const response = await StatusService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = StatusController
