const mongoose = require('mongoose')
const actStatus = require('../enums/ActStatus')

const jobsSchema = new mongoose.Schema({ _id: false }, { versionKey: false })

jobsSchema.add({
  key: {},
  children: [jobsSchema],
  data: {},
})

const roomSchema = new mongoose.Schema(
  {
    _id: false,
    id: {
      type: String,
      required: true,
    },
    jobs: [jobsSchema],
  },
  { versionKey: false }
)

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rooms: [roomSchema],
    outlay: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Outlay',
      required: true,
    },
    status: {
      enum: Object.values(actStatus),
      type: String,
      default: actStatus.NEW,
    },
  },
  {
    versionKey: false,
  }
)

schema.set('timestamps', true)

const Act = mongoose.model('Act', schema)

module.exports = Act