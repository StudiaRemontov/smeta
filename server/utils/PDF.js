const { chromium } = require('playwright')

class PDF {
  static async generate(path, filename) {
    try {
      const browser = await chromium.launch()
      const page = await browser.newPage()
      await page.goto(path, {
        waitUntil: 'domcontentloaded',
      })
      await page.waitForFunction(() => !!document.querySelector('.wrapper'))
      const fileName = `${filename}.pdf`
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
      return await browser.close()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = PDF
