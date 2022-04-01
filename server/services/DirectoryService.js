const mongoose = require('mongoose')

const Directory = require('../models/Directory')
const ApiError = require('../utils/ApiError')

class DirectoryService {
  static async getSubFolders(directory) {
    const children = await Directory.find({
      parent: directory._id + '',
    })

    if (children.length === 0) {
      return []
    }
    const subChilds = await Promise.all(
      children.map(async (d) => await DirectoryService.getSubFolders(d))
    )
    return [...children, ...subChilds].flat()
  }

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
    return await Directory.findByIdAndDelete(id)
  }

  static async removeSubFolders(id) {
    const currentDirectory = await Directory.findById(id)
    if (!currentDirectory) {
      throw ApiError.BadRequest('Directory not found')
    }
    const subFolders = await DirectoryService.getSubFolders(currentDirectory)
    for (const folder of subFolders) {
      await DirectoryService.delete(folder._id)
    }
  }
}

module.exports = DirectoryService
