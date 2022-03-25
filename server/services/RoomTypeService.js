const RoomType = require('../models/RoomType')

class RoomTypeService {
  static async get() {
    return await RoomType.find().lean()
  }

  static async create(data) {
    const roomType = new RoomType({ ...data })
    await roomType.save()
    return roomType
  }

  static async update(id, data) {
    const room = await RoomType.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    return room
  }

  static async delete(id) {
    return await RoomType.deleteOne({ _id: id })
  }
}

module.exports = RoomTypeService
