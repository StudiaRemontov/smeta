const OutlayService = require('../services/OutlayService')
const PDF = require('../utils/PDF')

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

  static async setActive(req, res, next) {
    try {
      const id = req.params.id
      const response = await OutlayService.setActive(id)

      return res.json({ updated: response })
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

  static async createPDF(req, res, next) {
    try {
      const { domain } = req.body
      const { id } = req.params
      const path = `${domain}/print/${id}`
      await PDF.generate(path, 'smeta')
      res.json({ message: 'finished' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = OutlayController
