const SubcategoryService = require('../services/SubcategoryService')

class SubcategoryController {
  static async getAll(req, res) {
    try {
      const response = await SubcategoryService.get()

      return res.json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  }

  static async create(req, res) {
    try {
      const data = req.body
      const response = await SubcategoryService.create(data)

      return res.json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await SubcategoryService.update(id, data)

      return res.json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  }
}

module.exports = SubcategoryController
