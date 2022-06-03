const OutlayService = require('../services/OutlayService')
const { chromium } = require('playwright')
const config = require('../config')

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
      const browser = await chromium.launch()
      const page = await browser.newPage()
      await page.goto(`${domain}/print/${id}`, {
        waitUntil: 'domcontentloaded',
      })
      await page.waitForFunction(() => !!document.querySelector('.wrapper'))
      const fileName = `smeta.pdf`
      await page.pdf({
        path: `pdf/${fileName}`,
        format: 'A4',
        margin: {
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
        },
      })
      await browser.close()
      res.json({ message: 'finished' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = OutlayController
