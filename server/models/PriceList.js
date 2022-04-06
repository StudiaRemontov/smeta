const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    editions: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Edition',
      },
    ],
  },
  {
    versionKey: false,
  }
)

const PriceList = mongoose.model('PriceList', schema)

module.exports = PriceList
