import { roomOptions } from '../enum/roomOptions'
import mathExp from 'math-expression-evaluator'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('outlay', ['rooms']),
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
    sumParameters(obj1, obj2) {
      return Object.entries(obj2).reduce((props, [key, value]) => {
        const sum = value + (obj1[key] || 0)
        props[key] = sum
        return props
      }, {})
    },
    getTotalParametersOfRooms(rooms) {
      const roomsWithOptions = rooms.filter(r => r.options)
      return roomsWithOptions.reduce((acc, room) => {
        const { options } = room
        const { computed } = this.calculateAllParameters(options)
        return this.sumParameters(acc, computed)
      }, {})
    },
  },
}
