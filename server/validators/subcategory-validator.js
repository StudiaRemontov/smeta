const SubcategoryService = require('../services/SubcategoryService')
const ApiError = require('../utils/ApiError')

class SubcategoryValidator {
  static async checkJobs(req, res, next) {
    try {
      const id = req.params.id
      const subcategory = await SubcategoryService.getById(id)
      if (subcategory.jobs.length > 0) {
        return next(ApiError.BadRequest('Cannot remove subcategory with jobs'))
      }
    } catch (error) {
      return next(ApiError.BadRequest(error.message))
    }

    next()
  }
}

module.exports = SubcategoryValidator
