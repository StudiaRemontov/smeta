const Category = require('../models/Category')

class CategoryService {
  static async get() {
    return await Category.find().lean()
  }

  static async create(data) {
    const category = new Category({ ...data })
    await category.save()
    return category
  }

  static async update(id, data) {
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    return category
  }
}

module.exports = CategoryService
