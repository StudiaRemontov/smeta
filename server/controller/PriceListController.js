const PriceListService = require('../services/PriceListService')

class DirectoryController {
  static async getAll(req, res, next) {
    try {
      const response = await PriceListService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body

      const response = await PriceListService.create(data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await PriceListService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      const response = await PriceListService.delete(id)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = DirectoryController
