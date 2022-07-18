const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    keys: {
      type: Array,
      default: [],
    },
    values: {
      type: mongoose.SchemaTypes.Mixed,
      default: false,
    },
    parent: {
      type: mongoose.SchemaTypes.Mixed,
      default: null,
    },
    children: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Directory' }],
  },
  { versionKey: false }
)

const Directory = mongoose.model('Directory', schema)

module.exports = Directory
