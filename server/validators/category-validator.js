const CategoryService = require('../services/CategoryService')
const ApiError = require('../utils/ApiError')

class CategoryValidator {
  static async checkSubcategories(req, res, next) {
    try {
      const id = req.params.id
      const category = await CategoryService.getById(id)
      if (category.subCategories.length > 0) {
        return next(
          ApiError.BadRequest('Cannot remove category with subcategories')
        )
      }
    } catch (error) {
      return next(ApiError.BadRequest(error.message))
    }

    next()
  }
}

module.exports = CategoryValidator
