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
  name: String,
  subItems: [dataItem],
  values: [
    {
      id: String,
      data: mongoose.SchemaTypes.Mixed,
      _id: false,
    },
  ],
  dirId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Directory',
  },
})

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
    dirId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Directory',
    },
    keys: [keySchema],
    data: [dataItem],
  },
  {
    versionKey: false,
  }
)

const Edition = mongoose.model('Edition', schema)

module.exports = Edition
