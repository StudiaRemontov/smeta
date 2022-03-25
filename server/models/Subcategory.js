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
          unique: true,
        },
        price: Number,
        unit: {
          type: String,
          required: true,
          enum: ['м/п', 'м2', 'т', 'кг', 'шт'],
        },
        formula: {
          type: String,
          enum: ['P', 'SW', 'SF', 'none'],
          default: 'none',
        },
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
