import { generateMongoId } from '@/helpers/generateMongoId'
import { actStatus } from '../enum/actStatus'

class Act {
  constructor(name, outlay) {
    this._id = generateMongoId()
    this.name = name
    this.outlay = outlay
    this.status = actStatus.NEW
    this.rooms = []
    const currentDate = new Date()
    this.createdAt = currentDate
    this.updatedAt = currentDate
  }
}

export default Act
