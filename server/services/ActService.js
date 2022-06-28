const Act = require('../models/Act')
const ApiError = require('../utils/ApiError')

class ActService {
  static async get() {
    return await Act.find().lean()
  }

  static async create(data) {
    const act = new Act({ ...data })
    await act.save()
    return act
  }

  static async update(id, data) {
    const act = await Act.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!act) {
      throw ApiError.BadRequest('Act not found')
    }

    return act
  }

  static async delete(id) {
    const act = await Act.findByIdAndDelete(id)
    if (!act) {
      throw ApiError.BadRequest('Act not found')
    }
    return act
  }
}

module.exports = ActService
