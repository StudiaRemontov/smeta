import { InputType } from '../enum/InputType'

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
      return 0
    }

    return null
  }
}
