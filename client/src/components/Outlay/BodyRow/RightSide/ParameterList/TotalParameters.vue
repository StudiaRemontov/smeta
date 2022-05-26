<script>
import { mapGetters } from 'vuex'
import ComputedParameters from './ComputedParameters.vue'

import roomParameters from '@/mixins/roomParameters.mixin'

export default {
  components: {
    ComputedParameters,
  },
  mixins: [roomParameters],
  computed: {
    ...mapGetters('outlay', ['rooms']),
    totalComputedParameters() {
      return this.rooms.reduce((acc, room) => {
        const { options } = room
        const { computed } = this.calculateAllParameters(options)
        return this.sumParameters(acc, computed)
      }, {})
    },
  },
  methods: {
    sumParameters(obj1, obj2) {
      return Object.entries(obj2).reduce((props, [key, value]) => {
        const sum = value + (obj1[key] || 0)
        props[key] = sum
        return props
      }, {})
    },
  },
}
</script>

<template>
  <span class="title"> Итоговые параметры </span>
  <ComputedParameters :parameters="totalComputedParameters" />
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
