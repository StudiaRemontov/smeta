const Category = require('../models/Category')
const ApiError = require('../utils/ApiError')

class CategoryService {
  static async get() {
    return await Category.find().lean()
  }

  static async getById(id) {
    const category = await Category.findById(id)

    if (!category) {
      throw ApiError.BadRequest('Category not found')
    }
    return category
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

    if (!category) {
      throw ApiError.BadRequest('Category not found')
    }

    return category
  }

  static async delete(id) {
    return await Category.deleteOne({ _id: id })
  }
}

module.exports = CategoryService
