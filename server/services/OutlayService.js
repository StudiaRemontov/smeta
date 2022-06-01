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

  static async setActive(id) {
    const activeBefore = await Outlay.findOne({ active: true })
    const activeNow = await OutlayService.update(id, {
      active: true,
    })
    if (!activeBefore || activeBefore._id.equals(id)) {
      return [activeNow]
    }
    activeBefore.active = false
    await activeBefore.save()
    return [activeNow, activeBefore]
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
