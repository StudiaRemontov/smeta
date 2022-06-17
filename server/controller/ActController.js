const ActService = require('../services/ActService')

class ActController {
  static async getAll(req, res, next) {
    try {
      const response = await ActService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body

      const response = await ActService.create(data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await ActService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      const response = await ActService.delete(id)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = ActController
