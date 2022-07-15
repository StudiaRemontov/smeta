<script>
import ParameterItem from './ParameterItem.vue'
import roomParameters from '@/mixins/roomParameters.mixin'
import { formatNumber } from '@/helpers/formatNumber'

export default {
  components: {
    ParameterItem,
  },
  mixins: [roomParameters],
  props: {
    parametersData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    names() {
      const { floorArea, perimeter, wallArea } = this.roomOptions
      return {
        [floorArea]: 'S пола',
        [wallArea]: 'S стен',
        [perimeter]: 'Периметер',
      }
    },
    parameters() {
      return Object.entries(this.parametersData).map(([key, value]) => {
        const name = this.names[key]
        const formatted = formatNumber(value)
        return {
          name,
          value: formatted,
        }
      })
    },
  },
}
</script>

<template>
  <div class="computed-parameters">
    <ParameterItem
      v-for="parameter in parameters"
      :key="parameter.name"
      :name="parameter.name"
      :value="parameter.value"
    />
  </div>
</template>

<style lang="scss" scoped>
.computed-parameters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
</style>
