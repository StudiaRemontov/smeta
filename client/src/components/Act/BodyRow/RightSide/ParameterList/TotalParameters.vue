<script>
import { mapGetters } from 'vuex'
import ComputedParameters from './ComputedParameters.vue'

import roomParameters from '@/mixins/roomParameters.mixin'
import keyTypes from '@/mixins/keyTypes.mixin'

export default {
  components: {
    ComputedParameters,
  },
  mixins: [roomParameters, keyTypes],
  computed: {
    ...mapGetters('outlay', ['rooms']),
    ...mapGetters('directory', ['roomDirectory']),
    roomsWithOptions() {
      const { keys } = this.roomDirectory
      const parametersKey = keys.find(
        k => k.type === this.InputType.BOOLEAN_ROOM_PARAMETERS,
      )
      const computedKey = keys.find(
        k => k.type === this.InputType.BOOLEAN_ROOM_COMPUTED,
      )
      return this.rooms.filter(room => {
        const { dirId } = room
        if (!dirId) {
          return true
        }
        const roomData = this.roomDirectory.values.find(r => r.id === dirId)
        if (!roomData.data[parametersKey.id]) {
          return false
        }
        if (!roomData.data[computedKey.id]) {
          return false
        }
        return true
      })
    },
    totalComputedParameters() {
      return this.getTotalParametersOfRooms(this.roomsWithOptions)
    },
  },
}
</script>

<template>
  <span class="title"> Итоговые параметры </span>
  <ComputedParameters :parametersData="totalComputedParameters" />
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
