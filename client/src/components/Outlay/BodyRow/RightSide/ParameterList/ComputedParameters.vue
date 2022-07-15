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
    floorAreaData() {
      return {
        name: 'S пола',
        value: this.parametersData[this.roomOptions.floorArea],
      }
    },
    wallAreaData() {
      return {
        name: 'S стен',
        value: this.parametersData[this.roomOptions.wallArea],
      }
    },
    perimeterData() {
      return {
        name: 'Периметр',
        value: this.parametersData[this.roomOptions.perimeter],
      }
    },
    parameters() {
      return [this.floorAreaData, this.wallAreaData, this.perimeterData]
    },
  },
  methods: {
    format(value) {
      return formatNumber(value)
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
      :value="format(parameter.value)"
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
