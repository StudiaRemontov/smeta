import { roomOptions } from '../enum/roomOptions'
import mathExp from 'math-expression-evaluator'

export default {
  computed: {
    roomOptions() {
      return roomOptions
    },
  },
  methods: {
    calculate(exeption) {
      try {
        return mathExp.eval(exeption)
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
    calculateAllParameters(options) {
      const spaces = this.calculate(options.spaces)
      const width = this.calculate(options.width)
      const height = this.calculate(options.height)
      const length = this.calculate(options.length)
      const perimeter = this.getPerimeter(width, length)
      const floorArea = this.getFloorArea(width, length)
      const wallArea = this.getWallArea(perimeter, height, spaces)
      return {
        computed: {
          [roomOptions.perimeter]: perimeter,
          [roomOptions.floorArea]: floorArea,
          [roomOptions.wallArea]: wallArea,
        },
        options: {
          [roomOptions.height]: height,
          [roomOptions.width]: width,
          [roomOptions.length]: length,
          [roomOptions.spaces]: spaces,
        },
      }
    },
  },
}
