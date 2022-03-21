const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    jobs: [
      {
        name: {
          required: true,
          type: String,
        },
        price: Number,
        unit: String,
        _id: false,
      },
    ],
  },
  {
    versionKey: false,
  }
)

const Subcategory = mongoose.model('Subcategory', schema)

module.exports = Subcategory
