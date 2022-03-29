const Directory = require('../models/Directory')
const ApiError = require('../utils/ApiError')

class DirectoryService {
  static async get() {
    return await Directory.find().lean()
  }

  static async getById(id) {
    const directory = await Directory.findById(id)

    if (!directory) {
      throw ApiError.BadRequest('Directory not found')
    }
    return directory
  }

  static async create(data) {
    const directory = new Directory({ ...data })
    await directory.save()
    return directory
  }

  static async update(id, data) {
    const directory = await Directory.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!directory) {
      throw ApiError.BadRequest('Directory not found')
    }

    return directory
  }

  static async delete(id) {
    return await Directory.deleteOne({ _id: id })
  }
}

module.exports = DirectoryService
