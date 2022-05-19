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
    options: {
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      length: {
        type: Number,
        required: true,
      },
      spaces: {
        type: String,
        required: true,
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
      unique: true,
    },
    date: {
      type: Date,
      default: () => Date.now(),
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
  },
  {
    versionKey: false,
  }
)

const Outlay = mongoose.model('Outlay', schema)

module.exports = Outlay
