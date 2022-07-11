const Status = require('../models/Status')

class StatusService {
  static async get() {
    return await Status.findOne({})
  }
}

module.exports = StatusService
