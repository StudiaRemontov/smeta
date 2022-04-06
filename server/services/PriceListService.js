const PriceList = require('../models/PriceList')
const ApiError = require('../utils/ApiError')

class PriceListService {
  static async get() {
    return await PriceList.find().lean()
  }

  static async getById(id) {
    const priceList = await PriceList.findById(id)

    if (!priceList) {
      throw ApiError.BadRequest('Price list not found')
    }

    return priceList
  }

  static async create(data) {
    const priceList = new PriceList({ ...data })
    await priceList.save()
    return priceList
  }

  static async update(id, data) {
    const priceList = await PriceList.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!priceList) {
      throw ApiError.BadRequest('Price list not found')
    }

    return priceList
  }

  static async delete(id) {
    return await PriceList.deleteOne({ _id: id })
  }
}

module.exports = PriceListService
