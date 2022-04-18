const EditionService = require('../services/EditionService')

class DirectoryController {
  static async getAll(req, res, next) {
    try {
      const response = await EditionService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body

      const response = await EditionService.create(data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await EditionService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async setActive(req, res, next) {
    try {
      const id = req.params.id
      const response = await EditionService.setActive(id)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      const response = await EditionService.delete(id)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = DirectoryController
