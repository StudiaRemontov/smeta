const mongoose = require('mongoose')

const keySchema = new mongoose.Schema(
  {
    _id: false,
    id: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
  }
)

const dataItem = new mongoose.Schema({}, { versionKey: false })

dataItem.add({
  _id: false,
  key: {},
  children: [dataItem],
  data: {},
})

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    dirId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Directory',
    },
    date: {
      type: Date,
      default: () => Date.now(),
    },
    keys: [keySchema],
    data: {
      type: dataItem,
    },
  },
  {
    versionKey: false,
  }
)

const Edition = mongoose.model('Edition', schema)

module.exports = Edition
