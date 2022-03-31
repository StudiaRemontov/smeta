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

  static async pushDirectories(id, subDirId) {
    const directory = await Directory.findById(id)

    if (!directory) {
      throw ApiError.BadRequest('Directory not found')
    }

    directory.dirs.push(subDirId)
    directory.save()

    return directory
  }

  static async removeSubDir(id, subDirId) {
    const directory = await Directory.findById(id)

    if (!directory) {
      throw ApiError.BadRequest('Directory not found')
    }

    directory.dirs = directory.dirs.filter(
      (dir) => dir._id.toString() !== subDirId
    )
    directory.save()

    return directory
  }

  static async delete(id) {
    return await Directory.findByIdAndDelete(id)
  }
}

module.exports = DirectoryService
