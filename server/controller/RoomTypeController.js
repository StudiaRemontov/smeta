const RoomTypeService = require('../services/RoomTypeService')

class RoomTypeController {
  static async getAll(req, res) {
    try {
      const response = await RoomTypeService.get()
      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }

  static async create(req, res) {
    try {
      const data = req.body
      const response = await RoomTypeService.create(data)

      return res.json(response)
    } catch (error) {
      res.json(error)
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await RoomTypeService.update(id, data)

      return res.json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  }
}

module.exports = RoomTypeController
