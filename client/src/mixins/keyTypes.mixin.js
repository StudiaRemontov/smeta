import { InputType } from '../enum/InputType'

export default {
  computed: {
    typeOptions() {
      return Object.values(InputType)
    },
    InputType() {
      return InputType
    },
  },
}
