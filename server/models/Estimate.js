const mongoose = require('mongoose')

const roomSchema = {
  name: {
    type: String,
    required: true,
  },
  roomType: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'RoomType',
    required: true,
  },
  categories: [
    {
      _id: false,
      category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category',
      },
      subCategories: [
        {
          _id: false,
          subCategory: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Subcategory',
          },
          jobs: [
            {
              _id: false,
              name: String,
              price: Number,
              quantity: Number,
              unit: String,
            },
          ],
        },
      ],
    },
  ],
}

//smeta

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: () => Date.now(),
    },
    rooms: [
      {
        ...roomSchema,
        options: {
          _id: false,
          width: String,
          height: String,
          length: String,
          space: String,
        },
      },
    ],
    acts: [
      {
        ...roomSchema,
        date: {
          type: Date,
          default: () => Date.now(),
        },
      },
    ],
  },
  {
    versionKey: false,
  }
)

const Estimate = mongoose.model('Estimate', schema)

module.exports = Estimate
