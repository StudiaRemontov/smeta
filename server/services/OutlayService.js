const Outlay = require('../models/Outlay')
const ApiError = require('../utils/ApiError')

class OutlayService {
  static async get() {
    return await Outlay.find().lean()
  }

  static async getById(id) {
    const edition = await Outlay.findById(id)

    if (!edition) {
      throw ApiError.BadRequest('Outlay not found')
    }

    return edition
  }

  static async create(data) {
    const edition = new Outlay({ ...data })
    await edition.save()
    return edition
  }

  static async update(id, data) {
    const edition = await Outlay.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!edition) {
      throw ApiError.BadRequest('Outlay not found')
    }

    return edition
  }

  static async delete(id) {
    const edition = await Outlay.findByIdAndDelete(id)
    if (!edition) {
      throw ApiError.BadRequest('Outlay not found')
    }
    return edition
  }
}

module.exports = OutlayService
