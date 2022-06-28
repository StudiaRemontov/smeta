const Outlay = require('../models/Outlay')
const ApiError = require('../utils/ApiError')

class OutlayService {
  static async get() {
    return await Outlay.find().lean()
  }

  static async getById(id) {
    const outlay = await Outlay.findById(id)

    if (!outlay) {
      throw ApiError.BadRequest('Outlay not found')
    }

    return outlay
  }

  static async create(data) {
    const outlay = new Outlay({ ...data })
    await outlay.save()
    return outlay
  }

  static async update(id, data) {
    const outlay = await Outlay.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!outlay) {
      throw ApiError.BadRequest('Outlay not found')
    }

    return outlay
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
    const outlay = await Outlay.findByIdAndDelete(id)
    if (!outlay) {
      throw ApiError.BadRequest('Outlay not found')
    }
    return outlay
  }
}

module.exports = OutlayService
