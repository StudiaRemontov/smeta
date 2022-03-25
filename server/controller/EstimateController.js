const EstimateService = require('../services/EstimateService')

class EstimateController {
  static async getAll(req, res, next) {
    try {
      const response = await EstimateService.get()

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body
      const response = await EstimateService.create(data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await EstimateService.update(id, data)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async updateActs(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await EstimateService.update(id, data)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = EstimateController
