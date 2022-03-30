<script>
import { mapGetters } from 'vuex'
import OptionGroup from './OptionGroup.vue'
export default {
  name: 'SelectDirectories',
  components: {
    OptionGroup,
  },
  computed: {
    ...mapGetters('directory', ['directories']),
  },
}
</script>

<template>
  <div class="list">
    <OptionGroup v-for="dir in directories" :key="dir._id" :directory="dir" />
  </div>
</template>

<style lang="scss" scoped>
.list {
  margin-left: 10px;
}
</style>
