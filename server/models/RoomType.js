const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    categories: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    versionKey: false,
  }
)

const RoomType = mongoose.model('RoomType', schema)

module.exports = RoomType
