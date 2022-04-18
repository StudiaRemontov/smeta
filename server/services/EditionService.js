const Edition = require('../models/Edition')
const PriceList = require('../models/PriceList')
const ApiError = require('../utils/ApiError')

class EditionService {
  static async get() {
    return await Edition.find().lean()
  }

  static async getById(id) {
    const edition = await Edition.findById(id)

    if (!edition) {
      throw ApiError.BadRequest('Edition not found')
    }

    return edition
  }

  static async create(data) {
    const edition = new Edition({ ...data })
    await edition.save()
    return edition
  }

  static async update(id, data) {
    const edition = await Edition.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!edition) {
      throw ApiError.BadRequest('Edition not found')
    }

    return edition
  }

  static async setActive(id) {
    const edition = await EditionService.update(id, {
      active: true,
    })
    const priceList = await PriceList.findOne({ editions: id })
    const editions = priceList.editions.filter((eId) => eId + '' !== id)
    for (const edition of editions) {
      await EditionService.update(edition, {
        active: false,
      })
    }
    return edition
  }

  static async delete(id) {
    const edition = await Edition.findByIdAndDelete(id)
    if (!edition) {
      throw ApiError.BadRequest('Edition not found')
    }
    return edition
  }
}

module.exports = EditionService
