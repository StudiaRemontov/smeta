<script>
import ParameterItem from './ParameterItem.vue'
import roomParameters from '@/mixins/roomParameters.mixin'

export default {
  components: {
    ParameterItem,
  },
  mixins: [roomParameters],
  props: {
    parameters: {
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
    <ParameterItem name="S пола" :value="parameters[roomOptions.floorArea]" />
    <ParameterItem name="S стен" :value="parameters[roomOptions.wallArea]" />
    <ParameterItem name="Периметр" :value="parameters[roomOptions.perimeter]" />
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
