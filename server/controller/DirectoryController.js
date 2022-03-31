const DirectoryService = require('../services/DirectoryService')

class DirectoryController {
  static async getAll(req, res, next) {
    try {
      const response = await DirectoryService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body

      const response = await DirectoryService.create(data)
      if (data.parent) {
        await DirectoryService.pushDirectories(data.parent, response._id)
      }
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body

      const response = await DirectoryService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      const response = await DirectoryService.delete(id)
      if (response.parent) {
        await DirectoryService.removeSubDir(response.parent, id)
      }
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = DirectoryController
