<script>
import DirectoryItem from './DirectoryItem.vue'
import CreateButton from './CreateButton.vue'
import DirectoryForm from './DirectoryForm.vue'

export default {
  components: {
    DirectoryItem,
    CreateButton,
    DirectoryForm,
  },
  props: {
    items: {
      type: Array,
    },
    parent: {
      type: Object,
    },
  },
  data() {
    return {
      formVisible: false,
    }
  },
}
</script>

<template>
  <ul class="directory-list">
    <DirectoryItem
      v-for="item in items"
      :key="item.id"
      :parent="parent"
      :directory="item"
    />
    <DirectoryForm v-if="formVisible" @created="formVisible = false" />
    <CreateButton text="Создать папку" @click="formVisible = true" />
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
