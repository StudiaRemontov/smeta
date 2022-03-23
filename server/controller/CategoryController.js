const CategoryService = require('../services/CategoryService')

class CategoryController {
  static async getAll(req, res, next) {
    try {
      const response = await CategoryService.get()
      return res.json(response)
    } catch (error) {
      next(error)
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

  static async update(req, res) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await CategoryService.update(id, data)

      return res.json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  }
}

module.exports = CategoryController
