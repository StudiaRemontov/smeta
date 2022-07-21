<script>
import { mapGetters } from 'vuex'
import ComputedParameters from './ComputedParameters.vue'
import RoomParameters from './RoomOptions.vue'

import roomParameters from '@/mixins/roomParameters.mixin'

import { formatNumber } from '@/helpers/formatNumber'

export default {
  components: {
    RoomParameters,
    ComputedParameters,
  },
  mixins: [roomParameters],
  computed: {
    ...mapGetters('outlay', ['selectedRoom', 'rooms']),
    parameters() {
      return this.selectedRoom.options
    },
    allParameters() {
      const { rooms } = this.parameters
      if (rooms) {
        const roomsInUse = this.rooms.filter(r => rooms.includes(r.id))
        const computed = this.getTotalParametersOfRooms(roomsInUse)
        return { computed }
      }
      const parameters = this.calculateAllParameters(this.parameters)
      return Object.keys(parameters).reduce((p, key) => {
        p[key] = Object.entries(parameters[key]).reduce(
          (acc, [pKey, value]) => {
            acc[pKey] = formatNumber(value)
            return acc
          },
          {},
        )
        return p
      }, {})
    },
  },
}
</script>

<template>
  <span class="title">
    {{ selectedRoom.name }}
  </span>
  <div class="groups">
    <RoomParameters :parameters="allParameters.options" />
    <ComputedParameters :parametersData="allParameters.computed" />
  </div>
</template>

<style lang="scss" scoped>
.title {
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
  color: #000000;
  text-align: center;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
