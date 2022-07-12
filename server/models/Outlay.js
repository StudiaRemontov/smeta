const mongoose = require('mongoose')

const jobsSchema = new mongoose.Schema({ _id: false }, { versionKey: false })

jobsSchema.add({
  key: {},
  children: [jobsSchema],
  data: {},
  isClone: {
    type: Boolean,
    default: false,
  },
})

const addedJobSchema = new mongoose.Schema(
  { _id: false },
  { versionKey: false }
)

addedJobSchema.add({
  key: {},
  children: [addedJobSchema],
  data: {},
  added: {
    type: Boolean,
    default: true,
  },
})

const roomSchema = new mongoose.Schema(
  {
    _id: false,
    id: {
      type: String,
      required: true,
    },
    name: {
      required: true,
      type: String,
    },
    jobs: [jobsSchema],
    newJobs: [addedJobSchema],
    dirId: String,
    options: {
      width: {
        type: String,
      },
      height: {
        type: String,
      },
      length: {
        type: String,
      },
      spaces: {
        type: String,
      },
    },
  },
  { versionKey: false }
)

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    edition: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    sale: {
      type: Number,
      required: true,
      default: 0,
    },
    rooms: [roomSchema],
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    removedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
  }
)

schema.set('timestamps', true)

const Outlay = mongoose.model('Outlay', schema)

module.exports = Outlay
