const EstimateService = require('../services/EstimateService')

class EstimateController {
  static async getAll(req, res) {
    try {
      const response = await EstimateService.get()

      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }

  static async create(req, res) {
    try {
      const data = req.body
      const response = await EstimateService.create(data)

      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await EstimateService.update(id, data)
      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }

  static async updateActs(req, res) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await EstimateService.update(id, data)
      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }
}

module.exports = EstimateController
