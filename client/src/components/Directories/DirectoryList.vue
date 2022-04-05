<script>
import DirectoryItem from './DirectoryItem.vue'
import CreateButton from './CreateButton.vue'
import DirectoryForm from './DirectoryForm.vue'
import RemoveModal from './Modals/RemoveModal.vue'
import AlertModal from './Modals/AlertModal.vue'
import { mapActions } from 'vuex'

export default {
  components: {
    DirectoryItem,
    CreateButton,
    DirectoryForm,
    RemoveModal,
    AlertModal,
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
  methods: {
    ...mapActions('directory', ['removeDirectory']),
    async openRemove({ id, folderName, subItemsLength }) {
      const response = await this.$refs['remove-modal'].show({
        title: `Подтвердить удаление`,
        message: `Данная папка создаржит ${subItemsLength} элемента. При удалении этой папки все вложенные элементы будут удалены.`,
        folderName,
        okButton: 'Удалить',
        cancelButton: 'Отмена',
      })
      if (response) {
        try {
          await this.removeDirectory(id)
        } catch (error) {
          console.log(error)
        }
      }
    },
    openAlert({ paths }) {
      this.$refs['alert-modal'].show({
        title: `Данный справочник невозможно удалить`,
        paths: paths,
        okButton: 'Ок',
      })
    },
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
      @remove="openRemove"
      @alert="openAlert"
    />
    <DirectoryForm v-if="formVisible" @created="formVisible = false" />
    <CreateButton v-else text="Создать папку" @click="formVisible = true" />
    <RemoveModal ref="remove-modal" />
    <AlertModal ref="alert-modal" />
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
