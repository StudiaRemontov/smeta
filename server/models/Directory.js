const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.SchemaTypes.Mixed,
      default: false,
    },
    parent: {
      type: mongoose.SchemaTypes.Mixed,
      default: null,
    },
  },
  { versionKey: false }
)

const Directory = mongoose.model('Directory', schema)

module.exports = Directory
