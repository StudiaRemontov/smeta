const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    subCategories: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Subcategory',
        _id: false,
      },
    ],
  },
  {
    versionKey: false,
  }
)

const Category = mongoose.model('Category', schema)

module.exports = Category
