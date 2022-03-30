<script>
export default {
  name: 'OptionGroup',
  props: {
    directory: {
      type: Object,
    },
  },
}
</script>

<template>
  <ul class="list">
    <li>{{ directory.name }}</li>
    <template v-if="directory.dirs.length > 0">
      <OptionGroup
        v-for="dir in directory.dirs"
        :key="dir._id"
        :directory="dir"
      />
    </template>
  </ul>
</template>

<style lang="scss" scoped>
.list {
  margin-left: 10px;
}
</style>
