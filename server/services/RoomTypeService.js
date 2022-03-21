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
}

module.exports = RoomTypeService
