const RoomTypeService = require('../services/RoomTypeService')

class RoomTypeController {
  static async getAll(req, res, next) {
    try {
      const response = await RoomTypeService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body
      const response = await RoomTypeService.create(data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await RoomTypeService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      const response = await RoomTypeService.delete(id)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = RoomTypeController
