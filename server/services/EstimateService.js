const Estimate = require('../models/Estimate')

class EstimateService {
  static async get() {
    return await Estimate.find().lean()
  }

  static async create(data) {
    const estimate = new Estimate({ ...data })
    await estimate.save()
    return estimate
  }

  static async update(id, data) {
    const estimate = await Estimate.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    return estimate
  }
}

module.exports = EstimateService
