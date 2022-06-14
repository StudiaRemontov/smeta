import { generateMongoId } from '@/helpers/generateMongoId'

class Outlay {
  constructor(name, edition) {
    this._id = generateMongoId()
    this.name = name
    this.edition = edition
    this.sale = 0
    this.active = false
    this.rooms = []
    const currentDate = new Date()
    this.createdAt = currentDate
    this.updatedAt = currentDate
  }

  static getClone(cloningFrom) {
    const clone = JSON.parse(JSON.stringify(cloningFrom))
    clone._id = generateMongoId()
    clone.active = false
    const currentDate = new Date()
    clone.createdAt = currentDate
    clone.updatedAt = currentDate
    return clone
  }
}

export default Outlay
