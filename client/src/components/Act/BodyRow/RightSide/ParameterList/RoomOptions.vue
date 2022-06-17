<script>
import ParameterItem from './ParameterItem.vue'

export default {
  components: {
    ParameterItem,
  },
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
  <div class="room-options">
    <ParameterItem
      v-for="(val, key) in parameters"
      :key="key"
      :name="key"
      :value="val"
    />
  </div>
</template>

<style lang="scss" scoped>
.room-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
}
</style>
