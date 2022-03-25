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

  static async update(id, data) {
    const subcategory = await Subcategory.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    return subcategory
  }

  static async delete(id) {
    return await Subcategory.deleteOne({ _id: id })
  }
}

module.exports = SubcategoryService
