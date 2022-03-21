const Subcategory = require('../models/Subcategory')

class SubcategoryService {
  static async get() {
    return await Subcategory.find().lean()
  }

  static async create(data) {
    const subcategory = new Subcategory({ ...data })
    await subcategory.save()
    return subcategory
  }
}

module.exports = SubcategoryService
