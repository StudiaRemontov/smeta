import { roomOptions } from '../enum/roomOptions'
import mathExp from 'math-expression-evaluator'

export default {
  computed: {
    roomOptions() {
      return roomOptions
    },
  },
  methods: {
    getSpaces(value) {
      try {
        return mathExp.eval(value)
      } catch (error) {
        return 0
      }
    },
    getPerimeter(width, length) {
      return (width + length) * 2
    },
    getFloorArea(width, length) {
      return width * length
    },
    getWallArea(perimeter, height, spaces) {
      return perimeter * height - spaces
    },
  },
}
