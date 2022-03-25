const RoomTypeService = require('../services/RoomTypeService')
const ApiError = require('../utils/ApiError')

class RoomTypeValidator {
  static async checkCategories(req, res, next) {
    try {
      const id = req.params.id
      const roomType = await RoomTypeService.getById(id)
      if (roomType.categories.length > 0) {
        return next(
          ApiError.BadRequest('Cannot remove room type with categories')
        )
      }
    } catch (error) {
      return next(ApiError.BadRequest(error.message))
    }

    next()
  }
}

module.exports = RoomTypeValidator
