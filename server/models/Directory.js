const mongoose = require('mongoose')

const schema = new mongoose.Schema({}, { versionKey: false })

schema.add({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.SchemaTypes.Mixed,
    default: false,
  },
  dirs: [schema],
})

const Directory = mongoose.model('Directory', schema)

module.exports = Directory
