const OutlayService = require('../services/OutlayService')

class OutlayController {
  static async getAll(req, res, next) {
    try {
      const response = await OutlayService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body

      const response = await OutlayService.create(data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await OutlayService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      const response = await OutlayService.delete(id)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = OutlayController
