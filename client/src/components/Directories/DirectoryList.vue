<script>
import DirectoryItem from './DirectoryItem.vue'
import CreateButton from './CreateButton.vue'
import DirectoryForm from './DirectoryForm.vue'
import RemoveModal from './Modals/RemoveModal.vue'
import AlertModal from './Modals/AlertModal.vue'

import { mapActions } from 'vuex'

import draggable from 'vuedraggable'

export default {
  components: {
    DirectoryItem,
    CreateButton,
    DirectoryForm,
    RemoveModal,
    AlertModal,
    draggable,
  },
  props: {
    items: {
      type: Array,
    },
    loading: Boolean,
  },
  emits: ['sorted'],
  data() {
    return {
      formVisible: false,
      dragOptions: {},
    }
  },
  computed: {
    listItems: {
      get() {
        return this.items
      },
      async set(array) {
        const ids = array.map(item => item._id)
        this.$emit('sorted', ids)
      },
    },
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
          const { response } = error
          const message = response ? response.data.message : error.message
          this.$toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: message,
            life: 3000,
          })
        }
      }
    },
    openAlert({ priceList, directories }) {
      this.$refs['alert-modal'].show({
        title: `Данный справочник невозможно удалить`,
        directories,
        priceList,
        okButton: 'Ок',
      })
    },
  },
}
</script>

<template>
  <draggable
    v-model="listItems"
    :component-data="{ tag: 'ul', type: 'transition-group' }"
    tag="ul"
    item-key="id"
    :animation="200"
    :ghostClass="'ghost'"
    :disabled="loading"
    class="directory-list"
    :class="{ loading }"
  >
    <template #item="{ element }">
      <DirectoryItem
        :key="element.id"
        :directory="element"
        @remove="openRemove"
        @alert="openAlert"
      />
    </template>
    <template #footer>
      <DirectoryForm v-if="formVisible" @created="formVisible = false" />
      <CreateButton v-else text="Создать папку" @click="formVisible = true" />
    </template>
  </draggable>
  <RemoveModal ref="remove-modal" />
  <AlertModal ref="alert-modal" />
</template>

<style lang="scss" scoped>
.directory-list {
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 130px;
  gap: 20px;

  &.loading {
    opacity: 0.5;
  }
}
</style>
