<script>
import OptionGroup from './OptionGroup.vue'
export default {
  name: 'SelectDirectories',
  components: {
    OptionGroup,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <div class="list">
    <OptionGroup v-for="dir in options" :key="dir._id" :directory="dir" />
  </div>
</template>

<style lang="scss" scoped>
.list {
  margin-left: 10px;
}
</style>
