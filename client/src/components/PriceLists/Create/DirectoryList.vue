<script>
import DirectoryItem from './DirectoryItem.vue'

export default {
  components: {
    DirectoryItem,
  },
  props: {
    directories: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <ul class="directory-list">
    <DirectoryItem
      v-for="directory in directories"
      :key="directory._id"
      :directory="directory"
    />
  </ul>
</template>

<style lang="scss" scoped>
.directory-list {
  margin-top: 10px;
  padding-left: 30px;
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
