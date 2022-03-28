<script>
import DirectoryItem from './DirectoryItem.vue'
import CreateButton from './CreateButton.vue'

export default {
  components: {
    DirectoryItem,
    CreateButton,
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
    <DirectoryItem v-for="item in items" :key="item.id" :directory="item" />
    <CreateButton text="Создать папку" @click="$emit('create')" />
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
