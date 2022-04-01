<script>
import { mapGetters } from 'vuex'
export default {
  name: 'OptionGroup',
  props: {
    directory: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters('directory', ['directories']),
    children() {
      return this.directories.filter(d => d.parent === this.directory._id)
    },
  },
}
</script>

<template>
  <ul class="list">
    <li>{{ directory.name }}</li>
    <template v-if="children.length > 0">
      <OptionGroup v-for="dir in children" :key="dir._id" :directory="dir" />
    </template>
  </ul>
</template>

<style lang="scss" scoped>
.list {
  margin-left: 10px;
}
</style>
