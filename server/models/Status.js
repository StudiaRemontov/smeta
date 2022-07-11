const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    startedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    versionKey: false,
  }
)

const Status = mongoose.model('Status', schema)

module.exports = Status
