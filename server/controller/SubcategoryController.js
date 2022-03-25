const SubcategoryService = require('../services/SubcategoryService')

class SubcategoryController {
  static async getAll(req, res, next) {
    try {
      const response = await SubcategoryService.get()

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body
      const response = await SubcategoryService.create(data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await SubcategoryService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      const response = await SubcategoryService.delete(id)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = SubcategoryController
