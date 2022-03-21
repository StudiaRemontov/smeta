const SubcategoryService = require('../services/SubcategoryService')

class SubcategoryController {
  static async getAll(req, res) {
    try {
      const response = await SubcategoryService.get()

      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }

  static async create(req, res) {
    try {
      const data = req.body
      const response = await SubcategoryService.create(data)

      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }
}

module.exports = SubcategoryController
