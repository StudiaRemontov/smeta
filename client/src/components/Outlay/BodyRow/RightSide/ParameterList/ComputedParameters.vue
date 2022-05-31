<script>
import ParameterItem from './ParameterItem.vue'
import roomParameters from '@/mixins/roomParameters.mixin'

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
}
</script>

<template>
  <div class="computed-parameters">
    <ParameterItem
      name="S пола"
      :value="parametersData[roomOptions.floorArea]"
    />
    <ParameterItem
      name="S стен"
      :value="parametersData[roomOptions.wallArea]"
    />
    <ParameterItem
      name="Периметр"
      :value="parametersData[roomOptions.perimeter]"
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
