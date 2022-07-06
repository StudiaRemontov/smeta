import { InputType } from '../enum/InputType'
import roomTypes from '../enum/roomTypes'

export default class Key {
  constructor(name, type) {
    this.id = Date.now() + ''
    this.name = name
    this.type = type
  }

  static getDefaultValue(type) {
    if (type === InputType.STRING) {
      return ''
    }
    const numberTypes = [InputType.NUMBER, InputType.QUANTITY, InputType.PRICE]
    if (numberTypes.includes(type)) {
      return 1
    }

    if (type === InputType.ROOM_TYPE) {
      return roomTypes[0]
    }

    return null
  }
}
