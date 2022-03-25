<script>
import DirectoryItem from './DirectoryItem.vue'
import DirectoryCreate from './DirectoryCreate.vue'

export default {
  components: {
    DirectoryItem,
    DirectoryCreate,
  },
  props: {
    items: {
      type: Array,
    },
  },
}
</script>

<template>
  <ul class="directory-list">
    <DirectoryItem />
    <DirectoryCreate />
  </ul>
</template>

<style lang="scss" scoped>
.directory-list {
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 130px;
  gap: 20px;
}
</style>
