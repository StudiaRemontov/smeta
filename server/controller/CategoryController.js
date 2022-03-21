const CategoryService = require('../services/CategoryService')

class CategoryController {
  static async getAll(req, res) {
    try {
      const response = await CategoryService.get()

      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }

  static async create(req, res) {
    try {
      const data = req.body
      const response = await CategoryService.create(data)

      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }
}

module.exports = CategoryController
