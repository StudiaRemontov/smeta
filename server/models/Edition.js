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

const dataItem = new mongoose.Schema({ _id: false }, { versionKey: false })

dataItem.add({
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
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
  }
)

const Edition = mongoose.model('Edition', schema)

module.exports = Edition
